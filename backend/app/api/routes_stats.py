from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.connection import get_db
from app.database.models import Lesson, FactualQCReport, InstructionalQCReport, LessonVersion

router = APIRouter(prefix="/api/stats", tags=["Dashboard Statistics"])

@router.get("")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Retrieve aggregate platform metrics for the Dashboard."""
    total_lessons = db.query(Lesson).count()
    completed_lessons = db.query(Lesson).filter(Lesson.status == "COMPLETED").count()
    in_review_lessons = db.query(Lesson).filter(Lesson.status == "IN_REVIEW").count()
    draft_lessons = db.query(Lesson).filter(Lesson.status == "DRAFT").count()

    avg_factual = db.query(func.avg(FactualQCReport.accuracy_score)).scalar() or 0.0
    avg_pedagogical = db.query(func.avg(InstructionalQCReport.pedagogical_score)).scalar() or 0.0

    recent_lessons = db.query(Lesson).order_by(Lesson.created_at.desc()).limit(5).all()
    recent_versions = db.query(LessonVersion).order_by(LessonVersion.created_at.desc()).limit(8).all()

    return {
        "total_lessons": total_lessons,
        "completed_lessons": completed_lessons,
        "in_review_lessons": in_review_lessons,
        "draft_lessons": draft_lessons,
        "average_factual_score": round(float(avg_factual), 1),
        "average_pedagogical_score": round(float(avg_pedagogical), 1),
        "recent_lessons": [
            {
                "id": l.id,
                "title": l.title,
                "learning_objective": l.learning_objective,
                "status": l.status,
                "estimated_duration_minutes": l.estimated_duration_minutes,
                "created_at": l.created_at
            }
            for l in recent_lessons
        ],
        "recent_activities": [
            {
                "id": v.id,
                "lesson_id": v.lesson_id,
                "lesson_title": v.title,
                "version_number": v.version_number,
                "change_description": v.change_description,
                "created_at": v.created_at
            }
            for v in recent_versions
        ]
    }

