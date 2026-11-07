import os
import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.core.config import settings
from app.core.logger import logger
from app.schemas.research import NormalizedSource

# Official authoritative domains to prioritize
AUTHORITATIVE_DOMAINS = [
    "edu", "gov", "org", "rfc-editor.org", "w3.org", "developer.mozilla.org",
    "python.org", "scikit-learn.org", "tensorflow.org", "pytorch.org",
    "mit.edu", "stanford.edu", "harvard.edu", "coursera.org", "khanacademy.org"
]

class TavilyResearchClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.TAVILY_API_KEY
        self.base_url = "https://api.tavily.com/search"

    async def search(self, query: str, max_results: int = 5) -> Dict[str, Any]:
        """
        Execute web search via Tavily API.
        Returns normalized list of web research results.
        """
        if not self.api_key:
            logger.warning("Tavily API key is not configured. Web research cannot query live Tavily API.")
            return {
                "status": "UNAVAILABLE",
                "error": "Tavily API key is missing. Set TAVILY_API_KEY in .env.",
                "sources": []
            }

        payload = {
            "api_key": self.api_key,
            "query": query,
            "search_depth": "advanced",
            "include_answer": True,
            "include_raw_content": False,
            "max_results": max_results
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(self.base_url, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    results = data.get("results", [])
                    sources: List[NormalizedSource] = []
                    for r in results:
                        url = r.get("url", "")
                        domain = url.split("//")[-1].split("/")[0]
                        # Calculate relevance score boost for authoritative domains
                        is_authoritative = any(auth in domain.lower() for auth in AUTHORITATIVE_DOMAINS)
                        score = float(r.get("score", 0.8))
                        if is_authoritative:
                            score = min(1.0, score + 0.15)

                        sources.append(NormalizedSource(
                            source_type="website",
                            title=r.get("title", "Educational Resource"),
                            url=url,
                            author_publisher=domain,
                            snippet=r.get("content", ""),
                            relevance_score=round(score, 2),
                            is_accessible=True,
                            metadata={
                                "domain": domain,
                                "is_authoritative": is_authoritative,
                                "raw_score": r.get("score", 0.0),
                                "retrieved_via": "Tavily API"
                            },
                            retrieved_at=datetime.utcnow()
                        ))
                    return {
                        "status": "SUCCESS",
                        "error": None,
                        "sources": sources
                    }
                else:
                    err_msg = f"Tavily returned status code {response.status_code}: {response.text}"
                    logger.error(err_msg)
                    return {
                        "status": "ERROR",
                        "error": err_msg,
                        "sources": []
                    }
        except Exception as e:
            err_msg = f"Exception during Tavily search: {str(e)}"
            logger.error(err_msg)
            return {
                "status": "ERROR",
                "error": err_msg,
                "sources": []
            }

