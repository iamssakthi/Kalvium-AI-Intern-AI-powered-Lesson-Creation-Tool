"""
AI Client — OpenRouter (OpenAI-compatible) with Multi-Model Fallback
=====================================================================
Routes requests through OpenRouter.  When the primary model is rate-limited
(429) or unavailable (404), automatically falls back through a priority chain
of free models until one succeeds.

Default fallback chain (all free / zero-cost):
  1. google/gemma-4-31b-it:free        — Google Gemma 4 31B, instruction-tuned
  2. google/gemma-4-26b-a4b-it:free    — Google Gemma 4 26B mixture-of-experts
  3. nvidia/nemotron-3.5-super-vl:free — NVIDIA Nemotron 3.5 Super, 1M ctx
  4. nvidia/nemotron-3.5-lightning:free — NVIDIA Nemotron 3.5 Lightning, 1M ctx
  5. nvidia/nemotron-3-ultra-550b-a55b:free — NVIDIA 550B ultra model

Change the primary model by setting OPENROUTER_MODEL in .env.
Customize the fallback list via OPENROUTER_FALLBACK_MODELS (comma-separated).
"""

import json
import re
import asyncio
from typing import Dict, Any, Optional, List

from openai import AsyncOpenAI, APIStatusError, APIConnectionError
from app.core.config import settings
from app.core.logger import logger
from app.core.errors import GeminiAPIException   # kept for backward compat


# Default fallback chain — tried in order when primary is rate-limited / gone
_DEFAULT_FALLBACK_MODELS: List[str] = [
    "google/gemma-4-31b-it:free",
    "google/gemma-4-26b-a4b-it:free",
    "nvidia/nemotron-3.5-super-vl:free",
    "nvidia/nemotron-3.5-lightning:free",
    "nvidia/nemotron-3-ultra-550b-a55b:free",
]


class GeminiClient:
    """
    Drop-in replacement for the original GeminiClient.
    Now routes all requests through OpenRouter's OpenAI-compatible endpoint
    with automatic model fallback on 429 / 404 errors.
    The class name is preserved so all existing imports remain unchanged.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
    ):
        self.api_key = api_key or settings.OPENROUTER_API_KEY
        self.model_name = model_name or settings.OPENROUTER_MODEL
        self.base_url = settings.OPENROUTER_BASE_URL

        # Build fallback chain: primary + deduped defaults
        self._fallback_chain: List[str] = [self.model_name]
        for m in _DEFAULT_FALLBACK_MODELS:
            if m not in self._fallback_chain:
                self._fallback_chain.append(m)

        if self.api_key:
            self._client = AsyncOpenAI(
                api_key=self.api_key,
                base_url=self.base_url,
                default_headers={
                    "HTTP-Referer": "http://localhost:8000",
                    "X-Title": "AI Lesson Creation Platform",
                },
            )
        else:
            self._client = None

    # ------------------------------------------------------------------
    # Public helpers
    # ------------------------------------------------------------------

    def is_configured(self) -> bool:
        return bool(self.api_key)

    async def generate_json(
        self,
        system_instruction: str,
        user_prompt: str,
        max_retries: int = 3,
    ) -> Dict[str, Any]:
        """
        Call the LLM via OpenRouter and return a parsed JSON dict.

        Strategy:
          - Try the primary model up to max_retries times.
          - On 429 (rate-limit) or 404 (unavailable), move to the next
            model in the fallback chain and retry from scratch.
          - Raise GeminiAPIException only if the entire chain is exhausted.
        """
        if not self.is_configured():
            logger.warning("OpenRouter API key not configured — cannot call live LLM.")
            raise GeminiAPIException(
                "Authentication",
                "OPENROUTER_API_KEY is missing from .env. "
                "Add it to enable live AI generation.",
            )

        messages = [
            {"role": "system", "content": system_instruction},
            {
                "role": "user",
                "content": (
                    f"{user_prompt}\n\n"
                    "IMPORTANT: Return ONLY a valid JSON object. "
                    "Do not add any explanatory text before or after the JSON. "
                    "Do not wrap in markdown code fences."
                ),
            },
        ]

        last_error: Optional[str] = None

        for model in self._fallback_chain:
            logger.info(f"Trying model: {model}")
            success = False

            for attempt in range(1, max_retries + 1):
                try:
                    logger.info(
                        f"OpenRouter request (attempt {attempt}/{max_retries}) "
                        f"model={model}"
                    )

                    response = await self._client.chat.completions.create(
                        model=model,
                        messages=messages,
                        temperature=0.2,
                        response_format={"type": "json_object"},
                    )

                    raw_text: str = response.choices[0].message.content or ""
                    raw_text = raw_text.strip()

                    # Strip markdown fences if any model ignores the hint
                    cleaned = re.sub(r"^```(?:json)?\s*", "", raw_text)
                    cleaned = re.sub(r"\s*```$", "", cleaned).strip()

                    parsed = json.loads(cleaned)
                    logger.info(f"OpenRouter ✓ valid JSON from model={model}")
                    return parsed

                except json.JSONDecodeError as jde:
                    logger.warning(
                        f"[{model}] JSON parse error attempt {attempt}: {jde}. "
                        f"Snippet: {raw_text[:200] if raw_text else 'empty'}"
                    )
                    last_error = f"Malformed JSON: {jde}"
                    await asyncio.sleep(1.0 * attempt)

                except APIStatusError as ase:
                    logger.warning(
                        f"[{model}] HTTP {ase.status_code} attempt {attempt}: {ase.message}"
                    )
                    last_error = f"HTTP {ase.status_code}: {ase.message}"

                    if ase.status_code in (401, 402, 403):
                        # Auth / billing — no point retrying any model
                        raise GeminiAPIException(
                            "Authentication",
                            f"OpenRouter rejected the API key (HTTP {ase.status_code}). "
                            "Check OPENROUTER_API_KEY in .env.",
                        )

                    if ase.status_code in (404, 429):
                        # Model gone or rate-limited — try next model immediately
                        logger.warning(
                            f"[{model}] {ase.status_code} — moving to next fallback model."
                        )
                        break  # break inner retry loop, outer loop advances model

                    await asyncio.sleep(2.0 * attempt)

                except APIConnectionError as ace:
                    logger.warning(f"[{model}] Connection error attempt {attempt}: {ace}")
                    last_error = f"Connection error: {ace}"
                    await asyncio.sleep(2.0 * attempt)

                except Exception as exc:
                    logger.warning(f"[{model}] Unexpected error attempt {attempt}: {exc}")
                    last_error = str(exc)
                    await asyncio.sleep(1.5 * attempt)

            else:
                # All retries exhausted for this model (non-break path)
                # This model just kept failing with non-429/404 errors
                logger.warning(f"[{model}] All {max_retries} attempts failed — trying next model.")

        raise GeminiAPIException(
            "Content Generation",
            f"All models in the fallback chain failed. Last error: {last_error}\n"
            f"Models tried: {', '.join(self._fallback_chain)}",
        )
