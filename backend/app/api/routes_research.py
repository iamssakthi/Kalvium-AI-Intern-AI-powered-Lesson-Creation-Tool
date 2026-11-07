from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.database.models import ResearchSource
from app.schemas.research import ResearchQueryRequest, ResearchResultSummary, NormalizedSource
from app.schemas.lesson import ResearchSourceResponse
from app.research.orchestrator import ResearchOrchestrator

router = APIRouter(prefix="/api/research", tags=["Research"])
orchestrator = ResearchOrchestrator()

@router.post("", response_model=ResearchResultSummary)
async def conduct_ad_hoc_research(req: ResearchQueryRequest):
    """Execute multi-source research across Tavily, YouTube, and Google Books."""
    return await orchestrator.execute_research(
        title=req.title,
        learning_objective=req.learning_objective,
        target_level=req.target_level
    )

@router.get("/lessons/{lesson_id}/sources", response_model=List[ResearchSourceResponse])
def get_lesson_sources(lesson_id: str, db: Session = Depends(get_db)):
    """Retrieve all research sources associated with a specific lesson."""
    return db.query(ResearchSource).filter(ResearchSource.lesson_id == lesson_id).all()

