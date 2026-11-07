import pytest
import uuid
from app.database.models import Lesson, LessonSection, QCRecommendation, LessonVersion
from app.services.qc_service import QCService

def test_apply_recommendation_flow(db_session):
    lesson_id = str(uuid.uuid4())
    lesson = Lesson(id=lesson_id, title="HTTP Protocol", learning_objective="Learn HTTP", estimated_duration_minutes=40)
    db_session.add(lesson)

    section = LessonSection(
        id=str(uuid.uuid4()),
        lesson_id=lesson_id,
        section_type="detailed_explanations",
        title="4. Status Codes",
        content="503 is Server Down.",
        estimated_minutes=10,
        order_index=1
    )
    db_session.add(section)

    rec_id = str(uuid.uuid4())
    rec = QCRecommendation(
        id=rec_id,
        lesson_id=lesson_id,
        qc_type="factual",
        audit_id="AUDIT-FACT-001",
        section_name="Status Codes",
        severity="MEDIUM",
        issue_text="503 should mention Retry-After",
        original_text="503 is Server Down.",
        recommended_fix="503 Service Unavailable: Server is overloaded or under maintenance, often including a Retry-After header.",
        status="PENDING"
    )
    db_session.add(rec)
    db_session.commit()

    # Apply recommendation
    res = QCService.apply_recommendation(db_session, rec_id)
    assert res["success"] is True
    assert res["status"] == "APPLIED"

    # Verify section was updated
    db_session.refresh(section)
    assert "Retry-After" in section.content

    # Verify version was created
    versions = db_session.query(LessonVersion).filter(LessonVersion.lesson_id == lesson_id).all()
    assert len(versions) == 1
    assert "Applied factual recommendation" in versions[0].change_description

def test_reject_recommendation_flow(db_session):
    lesson_id = str(uuid.uuid4())
    lesson = Lesson(id=lesson_id, title="ML Fundamentals", learning_objective="Learn ML")
    db_session.add(lesson)

    rec_id = str(uuid.uuid4())
    rec = QCRecommendation(
        id=rec_id,
        lesson_id=lesson_id,
        qc_type="instructional",
        audit_id="AUDIT-INST-002",
        section_name="Activities",
        severity="LOW",
        issue_text="Make activity more visual",
        recommended_fix="Add diagram",
        status="PENDING"
    )
    db_session.add(rec)
    db_session.commit()

    res = QCService.reject_recommendation(db_session, rec_id)
    assert res["success"] is True
    assert res["status"] == "REJECTED"

    db_session.refresh(rec)
    assert rec.status == "REJECTED"

