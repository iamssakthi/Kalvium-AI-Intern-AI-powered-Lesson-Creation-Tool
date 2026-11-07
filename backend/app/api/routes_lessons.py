from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.connection import get_db
from app.schemas.lesson import LessonCreateRequest, LessonUpdateRequest, LessonDetailResponse, LessonListItemResponse
from app.schemas.common import StandardResponse
from app.services.lesson_service import LessonService

router = APIRouter(prefix="/api/lessons", tags=["Lessons"])
lesson_service = LessonService()

@router.post("/generate", response_model=StandardResponse, status_code=status.HTTP_201_CREATED)
async def generate_lesson(req: LessonCreateRequest, db: Session = Depends(get_db)):
    """Generate a complete 45-minute lesson with multi-source research and dual QC audits."""
    lesson = await lesson_service.create_and_generate_lesson(db, req)
    return StandardResponse(
        success=True,
        message=f"Lesson '{lesson.title}' generated, researched, and audited successfully.",
        data={"lesson_id": lesson.id, "title": lesson.title, "duration": lesson.estimated_duration_minutes}
    )

@router.get("", response_model=List[LessonListItemResponse])
def get_lessons(
    search: Optional[str] = Query(None, description="Search by title or objective"),
    status: Optional[str] = Query(None, description="Filter by status (DRAFT, IN_REVIEW, COMPLETED)"),
    db: Session = Depends(get_db)
):
    """Retrieve all saved lessons with QC audit summary indicators."""
    return lesson_service.list_lessons(db, search=search, status_filter=status)

@router.get("/{lesson_id}", response_model=LessonDetailResponse)
def get_lesson(lesson_id: str, db: Session = Depends(get_db)):
    """Retrieve a lesson by ID with all sections and research sources."""
    return lesson_service.get_lesson(db, lesson_id)

@router.put("/{lesson_id}", response_model=LessonDetailResponse)
def update_lesson(lesson_id: str, update_in: LessonUpdateRequest, db: Session = Depends(get_db)):
    """Update lesson content or sections, preserving changes and creating a new version snapshot."""
    return lesson_service.update_lesson(db, lesson_id, update_in)

@router.delete("/{lesson_id}", response_model=StandardResponse)
def delete_lesson(lesson_id: str, db: Session = Depends(get_db)):
    """Delete a lesson and associated records."""
    lesson_service.delete_lesson(db, lesson_id)
    return StandardResponse(success=True, message=f"Lesson '{lesson_id}' deleted successfully.")

