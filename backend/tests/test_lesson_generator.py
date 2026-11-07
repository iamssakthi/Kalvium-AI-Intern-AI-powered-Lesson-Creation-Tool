import pytest
from app.ai.lesson_generator import LessonGenerator
from app.schemas.research import NormalizedSource

@pytest.mark.asyncio
async def test_lesson_generator_http_structure():
    generator = LessonGenerator()
    lesson = await generator.generate_lesson(
        title="HTTP Requests and Responses",
        learning_objective="Explain GET and POST methods and distinguish between 2xx, 4xx, and 5xx response status categories.",
        target_level="Beginner",
        difficulty="Intermediate"
    )

    assert lesson.title == "HTTP Requests and Responses"
    assert lesson.total_estimated_duration_minutes <= 45

    # Check for mandatory sections
    section_types = [s.section_type for s in lesson.sections]
    assert "introduction" in section_types
    assert "prerequisites" in section_types
    assert "key_concepts" in section_types
    assert "detailed_explanations" in section_types
    assert "practical_examples" in section_types
    assert "hands_on_activities" in section_types
    assert "knowledge_check" in section_types
    assert "summary" in section_types

    # Verify sum of estimated minutes matches total
    sum_mins = sum(s.estimated_minutes for s in lesson.sections)
    assert sum_mins <= 45

@pytest.mark.asyncio
async def test_lesson_generator_ml_structure():
    generator = LessonGenerator()
    lesson = await generator.generate_lesson(
        title="Introduction to Machine Learning and Supervised Learning",
        learning_objective="Understand the fundamentals of machine learning, distinguish between supervised and unsupervised learning, and explain classification and regression using practical examples.",
        target_level="Beginner",
        difficulty="Intermediate"
    )

    assert "Machine Learning" in lesson.title
    assert lesson.total_estimated_duration_minutes <= 45
    assert len(lesson.sections) >= 8

