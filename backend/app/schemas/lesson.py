from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.schemas.common import LessonStatus

class LessonCreateRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=255, description="Lesson title")
    learning_objective: str = Field(..., min_length=5, description="Lesson learning objective")
    target_level: Optional[str] = Field("Beginner", description="Target learner level")
    difficulty: Optional[str] = Field("Intermediate", description="Content difficulty level")
    instructor_instructions: Optional[str] = Field("", description="Optional custom instructor instructions")

class SectionCreateOrUpdate(BaseModel):
    id: Optional[str] = None
    lesson_id: Optional[str] = None
    section_type: str
    title: str
    content: str
    estimated_minutes: int = Field(..., ge=0, le=45)
    order_index: int = 0

class LessonUpdateRequest(BaseModel):
    title: Optional[str] = None
    learning_objective: Optional[str] = None
    target_level: Optional[str] = None
    difficulty: Optional[str] = None
    instructor_instructions: Optional[str] = None
    status: Optional[str] = None
    sections: Optional[List[SectionCreateOrUpdate]] = None
    change_description: Optional[str] = "Manual instructor edit"

class LessonSectionResponse(BaseModel):
    id: str
    lesson_id: str
    section_type: str
    title: str
    content: str
    estimated_minutes: int
    order_index: int

    class Config:
        from_attributes = True

class ResearchSourceResponse(BaseModel):
    id: str
    lesson_id: str
    source_type: str
    title: str
    url: str
    author_publisher: Optional[str] = None
    snippet: Optional[str] = None
    relevance_score: float
    is_accessible: bool
    metadata_json: Optional[str] = None
    retrieved_at: datetime

    class Config:
        from_attributes = True

class LessonDetailResponse(BaseModel):
    id: str
    title: str
    learning_objective: str
    target_level: str
    difficulty: str
    instructor_instructions: Optional[str] = None
    estimated_duration_minutes: int
    status: str
    created_at: datetime
    updated_at: datetime
    sections: List[LessonSectionResponse]
    sources: List[ResearchSourceResponse]

    class Config:
        from_attributes = True

class LessonListItemResponse(BaseModel):
    id: str
    title: str
    learning_objective: str
    target_level: str
    difficulty: str
    estimated_duration_minutes: int
    status: str
    created_at: datetime
    updated_at: datetime
    section_count: int
    source_count: int
    factual_qc_status: Optional[str] = None
    instructional_qc_status: Optional[str] = None

    class Config:
        from_attributes = True

# Structured JSON format expected from Gemini Lesson Generator
class GeneratedSection(BaseModel):
    section_type: str
    title: str
    content: str
    estimated_minutes: int

class GeneratedLessonStructure(BaseModel):
    title: str
    learning_objective: str
    target_audience: str
    total_estimated_duration_minutes: int
    sections: List[GeneratedSection]
    citations: List[Dict[str, str]] = Field(default_factory=list)

    @field_validator("total_estimated_duration_minutes")
    @classmethod
    def validate_duration(cls, v):
        if v > 45:
            raise ValueError(f"Total estimated lesson duration {v} minutes exceeds maximum 45 minutes.")
        return v

