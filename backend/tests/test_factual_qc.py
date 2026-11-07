import pytest
from app.ai.factual_qc import FactualQCEngine

@pytest.mark.asyncio
async def test_factual_qc_evaluation():
    engine = FactualQCEngine()
    sections = [
        {"title": "Introduction", "content": "HTTP is defined by RFC 9110."},
        {"title": "Methods", "content": "GET retrieves data and is safe. POST creates data."}
    ]
    sources = [
        {"title": "RFC 9110", "url": "https://www.rfc-editor.org/rfc/rfc9110.html", "snippet": "HTTP Semantics", "is_accessible": True}
    ]

    result = await engine.evaluate(
        lesson_id="test-lesson-123",
        lesson_title="HTTP Requests and Responses",
        learning_objective="Explain GET and POST",
        sections=sections,
        sources=sources
    )

    assert result.lesson_id == "test-lesson-123"
    assert result.audit_id.startswith("AUDIT-FACT")
    assert result.overall_status in ["PASS", "NEEDS IMPROVEMENT", "CRITICAL ISSUES"]
    # Score range is 0–100; exact value depends on live LLM or benchmark path
    assert 0.0 <= result.accuracy_score <= 100.0
    assert result.evaluation_summary is not None
    assert result.verification_limitations is not None

