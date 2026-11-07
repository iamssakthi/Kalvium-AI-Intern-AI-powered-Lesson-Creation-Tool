import pytest
from app.ai.instructional_qc import InstructionalQCEngine

@pytest.mark.asyncio
async def test_instructional_qc_evaluation():
    engine = InstructionalQCEngine()
    sections = [
        {"title": "Introduction", "content": "Welcome to HTTP.", "estimated_minutes": 5},
        {"title": "Detailed Explanations", "content": "Methods and codes.", "estimated_minutes": 25},
        {"title": "Summary", "content": "Wrap up.", "estimated_minutes": 15}
    ]

    result = await engine.evaluate(
        lesson_id="test-lesson-456",
        lesson_title="HTTP Requests and Responses",
        learning_objective="Explain GET and POST and status codes",
        target_level="Beginner",
        total_minutes=45,
        sections=sections
    )

    assert result.lesson_id == "test-lesson-456"
    assert result.audit_id.startswith("AUDIT-INST")
    assert result.overall_status in ["PASS", "NEEDS IMPROVEMENT", "CRITICAL ISSUES"]
    # Score range is 0–100; exact value depends on live LLM or benchmark path
    assert 0.0 <= result.pedagogical_score <= 100.0
    assert result.objective_alignment_assessment is not None
    assert result.clarity_assessment is not None
    assert result.structure_assessment is not None
    assert result.time_allocation_assessment is not None

