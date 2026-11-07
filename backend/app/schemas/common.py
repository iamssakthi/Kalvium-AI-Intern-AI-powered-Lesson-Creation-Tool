from pydantic import BaseModel, ConfigDict
from typing import Optional, Any
from enum import Enum

class QCStatus(str, Enum):
    PASS = "PASS"
    NEEDS_IMPROVEMENT = "NEEDS IMPROVEMENT"
    CRITICAL_ISSUES = "CRITICAL ISSUES"

class QCSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class RecommendationStatus(str, Enum):
    PENDING = "PENDING"
    APPLIED = "APPLIED"
    REJECTED = "REJECTED"

class LessonStatus(str, Enum):
    DRAFT = "DRAFT"
    IN_REVIEW = "IN_REVIEW"
    COMPLETED = "COMPLETED"

class StandardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    success: bool = True
    message: str = "Operation completed successfully"
    data: Optional[Any] = None

