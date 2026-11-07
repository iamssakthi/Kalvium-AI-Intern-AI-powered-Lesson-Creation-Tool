import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.database.connection import get_db
from app.database.models import FactualQCReport, InstructionalQCReport
from app.schemas.common import StandardResponse
from app.services.lesson_service import LessonService

router = APIRouter(prefix="/api/lessons", tags=["Quality Control"])
lesson_service = LessonService()

@router.get("/{lesson_id}/qc")
def get_qc_reports(lesson_id: str, db: Session = Depends(get_db)):
    """Retrieve both Factual Accuracy (Layer 1) and Instructional Quality (Layer 2) audit reports."""
    factual = db.query(FactualQCReport).filter(FactualQCReport.lesson_id == lesson_id).order_by(FactualQCReport.created_at.desc()).first()
    instructional = db.query(InstructionalQCReport).filter(InstructionalQCReport.lesson_id == lesson_id).order_by(InstructionalQCReport.created_at.desc()).first()

    return {
        "lesson_id": lesson_id,
        "factual_qc": json.loads(factual.raw_report_json) if factual else None,
        "instructional_qc": json.loads(instructional.raw_report_json) if instructional else None
    }

@router.post("/{lesson_id}/qc/factual", response_model=StandardResponse)
async def rerun_factual_qc(lesson_id: str, db: Session = Depends(get_db)):
    """Re-run Quality Control Layer 1 (Factual Accuracy) against the current lesson content."""
    res = await lesson_service.rerun_qc(db, lesson_id, qc_type="factual")
    return StandardResponse(success=True, message="Factual Accuracy QC re-evaluated.", data=res.get("factual"))

@router.post("/{lesson_id}/qc/instructional", response_model=StandardResponse)
async def rerun_instructional_qc(lesson_id: str, db: Session = Depends(get_db)):
    """Re-run Quality Control Layer 2 (Instructional Quality) against the current lesson content."""
    res = await lesson_service.rerun_qc(db, lesson_id, qc_type="instructional")
    return StandardResponse(success=True, message="Instructional Quality QC re-evaluated.", data=res.get("instructional"))

