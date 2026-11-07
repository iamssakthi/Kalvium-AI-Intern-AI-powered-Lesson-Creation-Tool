import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_api_dashboard_stats():
    response = client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_lessons" in data
    assert "completed_lessons" in data

def test_api_generate_and_manage_workflow():
    # 1. Generate Lesson (Test Scenario 1)
    payload = {
        "title": "HTTP Requests and Responses",
        "learning_objective": "Explain GET and POST methods and distinguish between 2xx, 4xx, and 5xx response status categories.",
        "target_level": "Beginner",
        "difficulty": "Intermediate",
        "instructor_instructions": "Focus on API debugging practices."
    }
    gen_res = client.post("/api/lessons/generate", json=payload)
    assert gen_res.status_code == 201
    gen_data = gen_res.json()
    assert gen_data["success"] is True
    lesson_id = gen_data["data"]["lesson_id"]

    # 2. Get Lesson Details
    detail_res = client.get(f"/api/lessons/{lesson_id}")
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["title"] == "HTTP Requests and Responses"
    assert detail_data["estimated_duration_minutes"] <= 45
    assert len(detail_data["sections"]) > 0
    assert len(detail_data["sources"]) > 0

    # 3. Get Sources
    sources_res = client.get(f"/api/research/lessons/{lesson_id}/sources")
    assert sources_res.status_code == 200
    assert len(sources_res.json()) > 0

    # 4. Get Dual QC Reports
    qc_res = client.get(f"/api/lessons/{lesson_id}/qc")
    assert qc_res.status_code == 200
    qc_data = qc_res.json()
    assert qc_data["factual_qc"] is not None
    assert qc_data["instructional_qc"] is not None
    assert qc_data["factual_qc"]["overall_status"] in ["PASS", "NEEDS IMPROVEMENT", "CRITICAL ISSUES"]
    assert qc_data["instructional_qc"]["overall_status"] in ["PASS", "NEEDS IMPROVEMENT", "CRITICAL ISSUES"]

    # 5. Get Recommendations & Apply
    recs_res = client.get(f"/api/lessons/{lesson_id}/recommendations")
    assert recs_res.status_code == 200
    recs = recs_res.json()
    if recs:
        rec_to_apply = recs[0]
        apply_res = client.post(f"/api/recommendations/{rec_to_apply['id']}/apply", json={"edited_fix": None})
        assert apply_res.status_code == 200
        assert apply_res.json()["status"] == "APPLIED"

    # 6. Preview Lesson
    prev_res = client.get(f"/api/lessons/{lesson_id}/preview")
    assert prev_res.status_code == 200
    assert prev_res.json()["id"] == lesson_id

    # 7. Export PDFs & JSON
    pdf_res = client.get(f"/api/lessons/{lesson_id}/export/pdf")
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"

    fact_pdf_res = client.get(f"/api/lessons/{lesson_id}/export/qc/factual")
    assert fact_pdf_res.status_code == 200
    assert fact_pdf_res.headers["content-type"] == "application/pdf"

    inst_pdf_res = client.get(f"/api/lessons/{lesson_id}/export/qc/instructional")
    assert inst_pdf_res.status_code == 200
    assert inst_pdf_res.headers["content-type"] == "application/pdf"

    json_res = client.get(f"/api/lessons/{lesson_id}/export/json")
    assert json_res.status_code == 200
    assert json_res.headers["content-type"] == "application/json"

    # 8. List Lessons
    list_res = client.get("/api/lessons")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

