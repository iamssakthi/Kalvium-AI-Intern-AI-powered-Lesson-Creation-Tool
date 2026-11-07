import json
from pathlib import Path
from sqlalchemy.orm import Session
from app.database.models import Lesson, LessonSection, ResearchSource, FactualQCReport, InstructionalQCReport, QCRecommendation, ExportRecord
from app.core.config import settings
from app.core.errors import ResourceNotFoundException, ExportGenerationException
from app.core.logger import logger
from app.exporters.pdf_lesson import generate_lesson_pdf
from app.exporters.pdf_factual_qc import generate_factual_qc_pdf
from app.exporters.pdf_instructional_qc import generate_instructional_qc_pdf
from app.exporters.json_exporter import export_lesson_package_json

class ExportService:
    @staticmethod
    def get_full_lesson_dict(db: Session, lesson_id: str) -> dict:
        lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if not lesson:
            raise ResourceNotFoundException("Lesson", lesson_id)

        sections = db.query(LessonSection).filter(LessonSection.lesson_id == lesson_id).order_by(LessonSection.order_index).all()
        sources = db.query(ResearchSource).filter(ResearchSource.lesson_id == lesson_id).all()
        factual_report = db.query(FactualQCReport).filter(FactualQCReport.lesson_id == lesson_id).order_by(FactualQCReport.created_at.desc()).first()
        instructional_report = db.query(InstructionalQCReport).filter(InstructionalQCReport.lesson_id == lesson_id).order_by(InstructionalQCReport.created_at.desc()).first()
        recommendations = db.query(QCRecommendation).filter(QCRecommendation.lesson_id == lesson_id).all()

        return {
            "id": lesson.id,
            "title": lesson.title,
            "learning_objective": lesson.learning_objective,
            "target_level": lesson.target_level,
            "difficulty": lesson.difficulty,
            "instructor_instructions": lesson.instructor_instructions,
            "estimated_duration_minutes": lesson.estimated_duration_minutes,
            "status": lesson.status,
            "created_at": str(lesson.created_at),
            "updated_at": str(lesson.updated_at),
            "sections": [
                {
                    "id": s.id,
                    "section_type": s.section_type,
                    "title": s.title,
                    "content": s.content,
                    "estimated_minutes": s.estimated_minutes,
                    "order_index": s.order_index
                }
                for s in sections
            ],
            "sources": [
                {
                    "id": src.id,
                    "source_type": src.source_type,
                    "title": src.title,
                    "url": src.url,
                    "author_publisher": src.author_publisher,
                    "snippet": src.snippet,
                    "relevance_score": src.relevance_score,
                    "is_accessible": src.is_accessible,
                    "metadata": json.loads(src.metadata_json) if src.metadata_json else {}
                }
                for src in sources
            ],
            "factual_qc": json.loads(factual_report.raw_report_json) if factual_report else None,
            "instructional_qc": json.loads(instructional_report.raw_report_json) if instructional_report else None,
            "recommendations": [
                {
                    "id": r.id,
                    "qc_type": r.qc_type,
                    "audit_id": r.audit_id,
                    "section_name": r.section_name,
                    "severity": r.severity,
                    "issue_text": r.issue_text,
                    "original_text": r.original_text,
                    "recommended_fix": r.recommended_fix,
                    "status": r.status
                }
                for r in recommendations
            ]
        }

    @staticmethod
    def export_lesson_pdf(db: Session, lesson_id: str) -> str:
        data = ExportService.get_full_lesson_dict(db, lesson_id)
        filename = f"lesson_{lesson_id[:8]}.pdf"
        output_path = str(settings.EXPORT_DIR_LESSONS / filename)

        try:
            generate_lesson_pdf(data, output_path)
            record = ExportRecord(
                lesson_id=lesson_id,
                export_type="lesson_pdf",
                file_path=output_path
            )
            db.add(record)
            db.commit()
            return output_path
        except Exception as e:
            logger.error(f"Error creating lesson PDF: {str(e)}")
            raise ExportGenerationException("Lesson PDF", str(e))

    @staticmethod
    def export_factual_qc_pdf(db: Session, lesson_id: str) -> str:
        data = ExportService.get_full_lesson_dict(db, lesson_id)
        factual_data = data.get("factual_qc")
        if not factual_data:
            raise ResourceNotFoundException("FactualQCReport", lesson_id)

        filename = f"factual_qc_{lesson_id[:8]}.pdf"
        output_path = str(settings.EXPORT_DIR_REPORTS / filename)

        try:
            generate_factual_qc_pdf(factual_data, data.get("title", ""), output_path)
            record = ExportRecord(
                lesson_id=lesson_id,
                export_type="factual_qc_pdf",
                file_path=output_path
            )
            db.add(record)
            db.commit()
            return output_path
        except Exception as e:
            logger.error(f"Error creating Factual QC PDF: {str(e)}")
            raise ExportGenerationException("Factual QC PDF", str(e))

    @staticmethod
    def export_instructional_qc_pdf(db: Session, lesson_id: str) -> str:
        data = ExportService.get_full_lesson_dict(db, lesson_id)
        inst_data = data.get("instructional_qc")
        if not inst_data:
            raise ResourceNotFoundException("InstructionalQCReport", lesson_id)

        filename = f"instructional_qc_{lesson_id[:8]}.pdf"
        output_path = str(settings.EXPORT_DIR_REPORTS / filename)

        try:
            generate_instructional_qc_pdf(inst_data, data.get("title", ""), output_path)
            record = ExportRecord(
                lesson_id=lesson_id,
                export_type="instructional_qc_pdf",
                file_path=output_path
            )
            db.add(record)
            db.commit()
            return output_path
        except Exception as e:
            logger.error(f"Error creating Instructional QC PDF: {str(e)}")
            raise ExportGenerationException("Instructional QC PDF", str(e))

    @staticmethod
    def export_json_package(db: Session, lesson_id: str) -> str:
        data = ExportService.get_full_lesson_dict(db, lesson_id)
        filename = f"lesson_package_{lesson_id[:8]}.json"
        output_path = str(settings.EXPORT_DIR_LESSONS / filename)

        try:
            export_lesson_package_json(data, output_path)
            record = ExportRecord(
                lesson_id=lesson_id,
                export_type="lesson_json",
                file_path=output_path
            )
            db.add(record)
            db.commit()
            return output_path
        except Exception as e:
            logger.error(f"Error creating JSON export: {str(e)}")
            raise ExportGenerationException("JSON Package", str(e))

