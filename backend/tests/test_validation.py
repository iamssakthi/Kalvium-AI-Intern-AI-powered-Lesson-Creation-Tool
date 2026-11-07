import pytest
from app.utils.timing_validator import calculate_reading_time, validate_and_normalize_timings
from app.schemas.lesson import LessonCreateRequest, GeneratedLessonStructure, GeneratedSection

def test_reading_time_calculation():
    # 300 words should be ~2 minutes at 150 wpm
    text = "word " * 300
    minutes = calculate_reading_time(text, words_per_minute=150)
    assert minutes == 2

    # Empty text returns minimum 1
    assert calculate_reading_time("") == 1

def test_normalize_timings_under_45():
    sections = [
        {"section_type": "introduction", "estimated_minutes": 5, "content": "Intro"},
        {"section_type": "detailed_explanations", "estimated_minutes": 20, "content": "Details"},
        {"section_type": "summary", "estimated_minutes": 5, "content": "Summary"}
    ]
    normalized = validate_and_normalize_timings(sections, max_limit=45)
    total = sum(s["estimated_minutes"] for s in normalized)
    assert total == 30
    assert total <= 45

def test_normalize_timings_exceeding_45():
    # Sections sum to 75 minutes! Must scale down to <= 45
    sections = [
        {"section_type": "introduction", "estimated_minutes": 10, "content": "Intro"},
        {"section_type": "detailed_explanations", "estimated_minutes": 40, "content": "Details"},
        {"section_type": "practical_examples", "estimated_minutes": 20, "content": "Examples"},
        {"section_type": "summary", "estimated_minutes": 5, "content": "Summary"}
    ]
    normalized = validate_and_normalize_timings(sections, max_limit=45)
    total = sum(s["estimated_minutes"] for s in normalized)
    assert total <= 45
    for s in normalized:
        assert s["estimated_minutes"] >= 1

def test_lesson_create_request_validation():
    # Valid
    req = LessonCreateRequest(title="HTTP Basics", learning_objective="Understand GET and POST")
    assert req.title == "HTTP Basics"
    assert req.target_level == "Beginner"

    # Too short title fails
    with pytest.raises(Exception):
        LessonCreateRequest(title="A", learning_objective="Valid objective")

    # Too short objective fails
    with pytest.raises(Exception):
        LessonCreateRequest(title="Valid Title", learning_objective="Hi")

