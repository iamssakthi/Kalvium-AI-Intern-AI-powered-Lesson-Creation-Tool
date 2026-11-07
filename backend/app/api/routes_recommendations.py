from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.schemas.qc import QCRecommendationResponse, ApplyRecommendationRequest, RecommendationActionResult
from app.services.qc_service import QCService

router = APIRouter(tags=["QC Recommendations"])

@router.get("/api/lessons/{lesson_id}/recommendations", response_model=List[QCRecommendationResponse])
def get_recommendations(lesson_id: str, db: Session = Depends(get_db)):
    """Retrieve all pending and processed QC recommendations for a lesson."""
    return QCService.get_recommendations_for_lesson(db, lesson_id)

@router.post("/api/recommendations/{recommendation_id}/apply", response_model=RecommendationActionResult)
def apply_recommendation(
    recommendation_id: str,
    req: ApplyRecommendationRequest = None,
    db: Session = Depends(get_db)
):
    """Apply a QC recommendation to update the corresponding lesson section."""
    custom_fix = req.edited_fix if req else None
    result = QCService.apply_recommendation(db, recommendation_id, custom_fix)
    return RecommendationActionResult(**result)

@router.post("/api/recommendations/{recommendation_id}/reject", response_model=RecommendationActionResult)
def reject_recommendation(recommendation_id: str, db: Session = Depends(get_db)):
    """Reject a QC recommendation."""
    result = QCService.reject_recommendation(db, recommendation_id)
    return RecommendationActionResult(**result)

