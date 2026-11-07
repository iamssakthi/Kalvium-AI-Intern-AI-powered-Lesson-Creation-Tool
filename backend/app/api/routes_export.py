from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.export_service import ExportService

router = APIRouter(prefix="/api/lessons", tags=["Preview & Exports"])

@router.get("/{lesson_id}/preview")
def get_lesson_preview(lesson_id: str, db: Session = Depends(get_db)):
    """Retrieve full aggregated lesson preview data."""
    return ExportService.get_full_lesson_dict(db, lesson_id)

@router.get("/{lesson_id}/export/pdf")
def export_lesson_pdf_endpoint(lesson_id: str, db: Session = Depends(get_db)):
    """Generate and download the formatted Lesson PDF."""
    pdf_path = ExportService.export_lesson_pdf(db, lesson_id)
    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"Lesson_{lesson_id[:8]}.pdf"
    )

@router.get("/{lesson_id}/export/qc/factual")
def export_factual_qc_pdf_endpoint(lesson_id: str, db: Session = Depends(get_db)):
    """Generate and download the Layer 1: Factual Accuracy QC Audit PDF."""
    pdf_path = ExportService.export_factual_qc_pdf(db, lesson_id)
    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"Factual_QC_Audit_{lesson_id[:8]}.pdf"
    )

@router.get("/{lesson_id}/export/qc/instructional")
def export_instructional_qc_pdf_endpoint(lesson_id: str, db: Session = Depends(get_db)):
    """Generate and download the Layer 2: Instructional Quality QC Audit PDF."""
    pdf_path = ExportService.export_instructional_qc_pdf(db, lesson_id)
    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"Instructional_QC_Audit_{lesson_id[:8]}.pdf"
    )

@router.get("/{lesson_id}/export/json")
def export_json_endpoint(lesson_id: str, db: Session = Depends(get_db)):
    """Generate and download the complete Lesson Package JSON."""
    json_path = ExportService.export_json_package(db, lesson_id)
    return FileResponse(
        path=json_path,
        media_type="application/json",
        filename=f"Lesson_Package_{lesson_id[:8]}.json"
    )

