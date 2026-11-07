from typing import List, Dict, Any
from app.core.logger import logger

MAX_LESSON_MINUTES = 45

# Standard baseline target allocations for sections (minutes)
DEFAULT_TIME_ALLOCATIONS = {
    "introduction": 3,
    "prerequisites": 3,
    "key_concepts": 6,
    "detailed_explanations": 10,
    "practical_examples": 7,
    "real_world_applications": 5,
    "hands_on_activities": 6,
    "knowledge_check": 3,
    "summary": 2,
    "additional_resources": 0,
    "references": 0
}

def calculate_reading_time(text: str, words_per_minute: int = 150) -> int:
    """Estimate reading/comprehension time in minutes based on word count."""
    if not text:
        return 1
    word_count = len(text.split())
    minutes = max(1, round(word_count / words_per_minute))
    return minutes

def validate_and_normalize_timings(sections: List[Dict[str, Any]], max_limit: int = MAX_LESSON_MINUTES) -> List[Dict[str, Any]]:
    """
    Ensure all sections have valid integer minutes and the sum <= max_limit (45).
    If the sum exceeds 45 minutes, re-scale dynamically and proportionally so that
    total duration strictly <= 45 minutes.
    """
    if not sections:
        return sections

    # First pass: ensure at least 1 minute for interactive/reading sections
    for sec in sections:
        current_time = sec.get("estimated_minutes")
        sec_type = sec.get("section_type", "").lower()
        if current_time is None or current_time <= 0:
            content = sec.get("content", "")
            if sec_type in ["additional_resources", "references"]:
                sec["estimated_minutes"] = 0
            else:
                sec["estimated_minutes"] = max(1, calculate_reading_time(content))

    total = sum(sec.get("estimated_minutes", 0) for sec in sections)

    if total <= max_limit:
        return sections

    logger.warning(f"Lesson total duration ({total}m) exceeds {max_limit}m limit. Adjusting proportionally.")
    
    # Scale down sections while preserving minimum 1 min for core instructional sections
    scaling_factor = max_limit / total
    accumulated = 0
    adjustable_sections = [s for s in sections if s.get("section_type") not in ["additional_resources", "references"]]

    for i, sec in enumerate(adjustable_sections):
        if i == len(adjustable_sections) - 1:
            # Last section takes remaining budget
            remaining = max(1, max_limit - accumulated)
            sec["estimated_minutes"] = remaining
        else:
            scaled = max(1, int(round(sec["estimated_minutes"] * scaling_factor)))
            sec["estimated_minutes"] = scaled
            accumulated += scaled

    # Verify final total
    final_total = sum(sec.get("estimated_minutes", 0) for sec in sections)
    if final_total > max_limit:
        excess = final_total - max_limit
        for sec in sorted(adjustable_sections, key=lambda s: s["estimated_minutes"], reverse=True):
            if excess <= 0:
                break
            if sec["estimated_minutes"] > 2:
                deduct = min(excess, sec["estimated_minutes"] - 1)
                sec["estimated_minutes"] -= deduct
                excess -= deduct

    return sections

