import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.database.models import QCRecommendation, LessonSection, LessonVersion, Lesson
from app.core.errors import ResourceNotFoundException
from app.core.logger import logger

class QCService:
    @staticmethod
    def get_recommendations_for_lesson(db: Session, lesson_id: str):
        """Retrieve all QC recommendations for a lesson."""
        return db.query(QCRecommendation).filter(QCRecommendation.lesson_id == lesson_id).all()

    @staticmethod
    def apply_recommendation(db: Session, recommendation_id: str, custom_fix: str = None) -> dict:
        """
        Apply a QC recommendation to the corresponding lesson section.
        Updates the lesson section, sets recommendation status to APPLIED,
        and saves a new LessonVersion snapshot.
        """
        rec = db.query(QCRecommendation).filter(QCRecommendation.id == recommendation_id).first()
        if not rec:
            raise ResourceNotFoundException("QCRecommendation", recommendation_id)

        lesson = db.query(Lesson).filter(Lesson.id == rec.lesson_id).first()
        if not lesson:
            raise ResourceNotFoundException("Lesson", rec.lesson_id)

        # Locate the affected section by title match or fallback
        sections = db.query(LessonSection).filter(LessonSection.lesson_id == lesson.id).all()
        target_section = None
        for s in sections:
            if rec.section_name.lower() in s.title.lower() or s.section_type.lower() in rec.section_name.lower():
                target_section = s
                break
        if not target_section and sections:
            # Fallback to the first matching detailed section
            target_section = sections[0]

        fix_to_apply = custom_fix if custom_fix and custom_fix.strip() else rec.recommended_fix

        if target_section:
            # If the original text is found in section, replace it; otherwise append/update
            if rec.original_text and rec.original_text in target_section.content:
                target_section.content = target_section.content.replace(rec.original_text, fix_to_apply)
            else:
                target_section.content += f"\n\n**[Applied QC Fix - {rec.qc_type.capitalize()}]:**\n{fix_to_apply}"

        # Mark recommendation as APPLIED
        rec.status = "APPLIED"
        rec.updated_at = datetime.now(timezone.utc)

        # Create new LessonVersion snapshot
        current_version_count = db.query(LessonVersion).filter(LessonVersion.lesson_id == lesson.id).count()
        snapshot = [
            {"id": s.id, "title": s.title, "section_type": s.section_type, "content": s.content, "estimated_minutes": s.estimated_minutes}
            for s in sections
        ]
        version = LessonVersion(
            lesson_id=lesson.id,
            version_number=current_version_count + 1,
            title=lesson.title,
            snapshot_json=json.dumps(snapshot),
            change_description=f"Applied {rec.qc_type} recommendation ({rec.id}) to {rec.section_name}"
        )
        db.add(version)
        db.commit()
        db.refresh(rec)

        logger.info(f"Successfully applied recommendation {recommendation_id} to lesson {lesson.id}")

        return {
            "success": True,
            "recommendation_id": rec.id,
            "status": "APPLIED",
            "message": f"Applied fix to {rec.section_name}",
            "updated_section_id": target_section.id if target_section else None
        }

    @staticmethod
    def reject_recommendation(db: Session, recommendation_id: str) -> dict:
        """Mark a QC recommendation as rejected by the instructor."""
        rec = db.query(QCRecommendation).filter(QCRecommendation.id == recommendation_id).first()
        if not rec:
            raise ResourceNotFoundException("QCRecommendation", recommendation_id)

        rec.status = "REJECTED"
        rec.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(rec)

        logger.info(f"Rejected recommendation {recommendation_id}")

        return {
            "success": True,
            "recommendation_id": rec.id,
            "status": "REJECTED",
            "message": "Recommendation rejected by instructor",
            "updated_section_id": None
        }

