import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database.connection import Base

def generate_uuid():
    return str(uuid.uuid4())

def get_utc_now():
    return datetime.now(timezone.utc)

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    learning_objective = Column(Text, nullable=False)
    target_level = Column(String(50), default="Beginner")
    difficulty = Column(String(50), default="Intermediate")
    instructor_instructions = Column(Text, nullable=True)
    estimated_duration_minutes = Column(Integer, default=45)
    status = Column(String(50), default="DRAFT")  # DRAFT, IN_REVIEW, COMPLETED
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    # Relationships
    sections = relationship("LessonSection", back_populates="lesson", cascade="all, delete-orphan", order_by="LessonSection.order_index")
    sources = relationship("ResearchSource", back_populates="lesson", cascade="all, delete-orphan")
    factual_reports = relationship("FactualQCReport", back_populates="lesson", cascade="all, delete-orphan")
    instructional_reports = relationship("InstructionalQCReport", back_populates="lesson", cascade="all, delete-orphan")
    recommendations = relationship("QCRecommendation", back_populates="lesson", cascade="all, delete-orphan")
    versions = relationship("LessonVersion", back_populates="lesson", cascade="all, delete-orphan", order_by="LessonVersion.version_number.desc()")
    exports = relationship("ExportRecord", back_populates="lesson", cascade="all, delete-orphan")

class LessonSection(Base):
    __tablename__ = "lesson_sections"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    lesson_id = Column(String(36), ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    section_type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    estimated_minutes = Column(Integer, default=5)
    order_index = Column(Integer, default=0)

    lesson = relationship("Lesson", back_populates="sections")

class ResearchSource(Base):
    __tablename__ = "research_sources"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    lesson_id = Column(String(36), ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    source_type = Column(String(50), nullable=False)  # website, book, youtube
    title = Column(String(500), nullable=False)
    url = Column(String(1000), nullable=False)
    author_publisher = Column(String(255), nullable=True)
    snippet = Column(Text, nullable=True)
    relevance_score = Column(Float, default=1.0)
    is_accessible = Column(Boolean, default=True)
    metadata_json = Column(Text, nullable=True)
    retrieved_at = Column(DateTime, default=get_utc_now)

    lesson = relationship("Lesson", back_populates="sources")

class FactualQCReport(Base):
    __tablename__ = "factual_qc_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    lesson_id = Column(String(36), ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    audit_id = Column(String(100), nullable=False)
    overall_status = Column(String(50), default="NEEDS IMPROVEMENT")  # PASS, NEEDS IMPROVEMENT, CRITICAL ISSUES
    accuracy_score = Column(Float, default=0.0)
    evaluation_summary = Column(Text, nullable=False)
    verification_limitations = Column(Text, nullable=True)
    raw_report_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=get_utc_now)

    lesson = relationship("Lesson", back_populates="factual_reports")

class InstructionalQCReport(Base):
    __tablename__ = "instructional_qc_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    lesson_id = Column(String(36), ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    audit_id = Column(String(100), nullable=False)
    overall_status = Column(String(50), default="NEEDS IMPROVEMENT")  # PASS, NEEDS IMPROVEMENT, CRITICAL ISSUES
    pedagogical_score = Column(Float, default=0.0)
    objective_alignment_assessment = Column(Text, nullable=True)
    clarity_assessment = Column(Text, nullable=True)
    structure_assessment = Column(Text, nullable=True)
    example_quality = Column(Text, nullable=True)
    activity_quality = Column(Text, nullable=True)
    assessment_quality = Column(Text, nullable=True)
    time_allocation_assessment = Column(Text, nullable=True)
    summary = Column(Text, nullable=False)
    raw_report_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=get_utc_now)

    lesson = relationship("Lesson", back_populates="instructional_reports")

class QCRecommendation(Base):
    __tablename__ = "qc_recommendations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    lesson_id = Column(String(36), ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    qc_type = Column(String(50), nullable=False)  # factual, instructional
    audit_id = Column(String(100), nullable=False)
    section_name = Column(String(100), nullable=False)
    severity = Column(String(50), default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    issue_text = Column(Text, nullable=False)
    original_text = Column(Text, nullable=True)
    recommended_fix = Column(Text, nullable=False)
    status = Column(String(50), default="PENDING")  # PENDING, APPLIED, REJECTED
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    lesson = relationship("Lesson", back_populates="recommendations")

class LessonVersion(Base):
    __tablename__ = "lesson_versions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    lesson_id = Column(String(36), ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    version_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    snapshot_json = Column(Text, nullable=False)
    change_description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

    lesson = relationship("Lesson", back_populates="versions")

class ExportRecord(Base):
    __tablename__ = "export_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    lesson_id = Column(String(36), ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    export_type = Column(String(50), nullable=False)  # lesson_pdf, factual_qc_pdf, instructional_qc_pdf, lesson_json
    file_path = Column(String(1000), nullable=False)
    created_at = Column(DateTime, default=get_utc_now)

    lesson = relationship("Lesson", back_populates="exports")

