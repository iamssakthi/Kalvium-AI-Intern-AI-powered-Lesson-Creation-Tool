from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.schemas.common import QCStatus, QCSeverity, RecommendationStatus

# --- Factual QC Schemas ---
class FactualIssueItem(BaseModel):
    issue_id: str
    severity: str = Field(..., description="LOW, MEDIUM, HIGH, CRITICAL")
    affected_section: str
    original_statement: str
    explanation: str
    supporting_evidence: str
    recommended_correction: str
    source_references: List[str] = Field(default_factory=list)
    confidence_level: str = "HIGH"

class FactualQCAuditResult(BaseModel):
    audit_id: str
    lesson_id: str
    overall_status: str = Field(..., description="PASS, NEEDS IMPROVEMENT, CRITICAL ISSUES")
    accuracy_score: float = Field(..., ge=0.0, le=100.0)
    evaluation_summary: str
    issues_identified: List[FactualIssueItem] = Field(default_factory=list)
    verification_limitations: str
    summary: str

# --- Instructional QC Schemas ---
class InstructionalIssueItem(BaseModel):
    issue_id: str
    severity: str = Field(..., description="LOW, MEDIUM, HIGH, CRITICAL")
    affected_section: str
    original_content: str
    explanation: str
    recommended_improvement: str

class InstructionalQCAuditResult(BaseModel):
    audit_id: str
    lesson_id: str
    overall_status: str = Field(..., description="PASS, NEEDS IMPROVEMENT, CRITICAL ISSUES")
    pedagogical_score: float = Field(..., ge=0.0, le=100.0)
    objective_alignment_assessment: str
    clarity_assessment: str
    structure_assessment: str
    example_quality: str
    activity_quality: str
    assessment_quality: str
    time_allocation_assessment: str
    issues_identified: List[InstructionalIssueItem] = Field(default_factory=list)
    summary: str

# --- Recommendation Management ---
class QCRecommendationResponse(BaseModel):
    id: str
    lesson_id: str
    qc_type: str
    audit_id: str
    section_name: str
    severity: str
    issue_text: str
    original_text: Optional[str] = None
    recommended_fix: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ApplyRecommendationRequest(BaseModel):
    edited_fix: Optional[str] = Field(None, description="Optional instructor-edited fix overriding the recommendation")

class RecommendationActionResult(BaseModel):
    success: bool
    recommendation_id: str
    status: str
    message: str
    updated_section_id: Optional[str] = None

