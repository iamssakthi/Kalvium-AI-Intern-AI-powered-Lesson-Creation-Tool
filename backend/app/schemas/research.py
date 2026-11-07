from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone

class ResearchQueryRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=255, description="Lesson title")
    learning_objective: str = Field(..., min_length=5, description="Lesson objective")
    target_level: Optional[str] = Field("Beginner", description="Target learner level")

class NormalizedSource(BaseModel):
    source_type: str = Field(..., description="website, book, or youtube")
    title: str
    url: str
    author_publisher: Optional[str] = None
    snippet: Optional[str] = None
    relevance_score: float = Field(default=1.0, ge=0.0, le=1.0)
    is_accessible: bool = True
    metadata: Dict[str, Any] = Field(default_factory=dict)
    retrieved_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ResearchResultSummary(BaseModel):
    total_sources: int
    website_count: int
    book_count: int
    youtube_count: int
    provider_status: Dict[str, str] # e.g. {"tavily": "SUCCESS", "youtube": "SUCCESS", "google_books": "SUCCESS"}
    sources: List[NormalizedSource]
