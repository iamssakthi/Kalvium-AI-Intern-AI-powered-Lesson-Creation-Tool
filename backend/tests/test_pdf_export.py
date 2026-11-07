import os
from pathlib import Path
from app.exporters.pdf_lesson import generate_lesson_pdf
from app.exporters.pdf_factual_qc import generate_factual_qc_pdf
from app.exporters.pdf_instructional_qc import generate_instructional_qc_pdf
from app.exporters.json_exporter import export_lesson_package_json

def test_generate_lesson_pdf(tmp_path):
    lesson_data = {
        "title": "HTTP Requests and Responses",
        "learning_objective": "Explain GET and POST methods and distinguish status categories",
        "target_level": "Beginner",
        "difficulty": "Intermediate",
        "estimated_duration_minutes": 45,
        "status": "COMPLETED",
        "sections": [
            {"title": "1. Introduction", "estimated_minutes": 5, "content": "Welcome to HTTP."},
            {"title": "2. Detailed Breakdown", "estimated_minutes": 25, "content": "### Code Example\n```python\nimport requests\nres = requests.get('url')\n```\nGET is idempotent."}
        ]
    }
    out_file = str(tmp_path / "test_lesson.pdf")
    res_path = generate_lesson_pdf(lesson_data, out_file)

    assert os.path.exists(res_path)
    assert os.path.getsize(res_path) > 1000

def test_generate_factual_qc_pdf(tmp_path):
    factual_data = {
        "audit_id": "AUDIT-FACT-TEST",
        "overall_status": "PASS",
        "accuracy_score": 96.0,
        "evaluation_summary": "Technical accuracy is verified against RFC 9110.",
        "issues_identified": [
            {
                "issue_id": "FACT-001",
                "severity": "LOW",
                "affected_section": "Methods",
                "original_statement": "503 is Server Down",
                "explanation": "Add Retry-After details.",
                "supporting_evidence": "RFC 9110 Sec 15.6.4",
                "recommended_correction": "503 Service Unavailable often includes Retry-After."
            }
        ],
        "verification_limitations": "Metadata only for books.",
        "summary": "Passed with high integrity."
    }
    out_file = str(tmp_path / "test_factual_qc.pdf")
    res_path = generate_factual_qc_pdf(factual_data, "HTTP Lesson", out_file)

    assert os.path.exists(res_path)
    assert os.path.getsize(res_path) > 1000

def test_generate_instructional_qc_pdf(tmp_path):
    inst_data = {
        "audit_id": "AUDIT-INST-TEST",
        "overall_status": "PASS",
        "pedagogical_score": 94.0,
        "objective_alignment_assessment": "Directly achieves objective.",
        "clarity_assessment": "Accessible explanations.",
        "structure_assessment": "Good scaffolding.",
        "example_quality": "Clean Python snippets.",
        "activity_quality": "DevTools hands-on exercise.",
        "assessment_quality": "Rigorous questions.",
        "time_allocation_assessment": "Total duration <= 45 minutes.",
        "issues_identified": [],
        "summary": "Excellent pedagogical pacing."
    }
    out_file = str(tmp_path / "test_inst_qc.pdf")
    res_path = generate_instructional_qc_pdf(inst_data, "HTTP Lesson", out_file)

    assert os.path.exists(res_path)
    assert os.path.getsize(res_path) > 1000

def test_export_json_package(tmp_path):
    data = {"lesson": "test", "status": "ok"}
    out_file = str(tmp_path / "test_package.json")
    res_path = export_lesson_package_json(data, out_file)

    assert os.path.exists(res_path)
    assert os.path.getsize(res_path) > 10

