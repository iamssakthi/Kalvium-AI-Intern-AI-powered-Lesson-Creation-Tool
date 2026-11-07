import json
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.database.models import Lesson, LessonSection, ResearchSource, FactualQCReport, InstructionalQCReport, QCRecommendation, LessonVersion
from app.schemas.lesson import LessonCreateRequest, LessonUpdateRequest, GeneratedLessonStructure
from app.core.errors import ResourceNotFoundException, DurationValidationException
from app.core.logger import logger
from app.research.orchestrator import ResearchOrchestrator
from app.ai.lesson_generator import LessonGenerator
from app.ai.factual_qc import FactualQCEngine
from app.ai.instructional_qc import InstructionalQCEngine
from app.utils.timing_validator import validate_and_normalize_timings

class LessonService:
    def __init__(
        self,
        research_orchestrator: Optional[ResearchOrchestrator] = None,
        lesson_generator: Optional[LessonGenerator] = None,
        factual_qc: Optional[FactualQCEngine] = None,
        instructional_qc: Optional[InstructionalQCEngine] = None
    ):
        self.orchestrator = research_orchestrator or ResearchOrchestrator()
        self.generator = lesson_generator or LessonGenerator()
        self.factual_qc = factual_qc or FactualQCEngine()
        self.instructional_qc = instructional_qc or InstructionalQCEngine()

    async def create_and_generate_lesson(self, db: Session, req: LessonCreateRequest) -> Lesson:
        """
        Full end-to-end pipeline:
        1. Research across Tavily, YouTube, and Google Books
        2. Generate structured lesson via Gemini AI
        3. Enforce 45-minute strict timing limit
        4. Persist lesson, sections, and sources in SQLite
        5. Run Quality Control Layer 1 (Factual Accuracy)
        6. Run Quality Control Layer 2 (Instructional Quality)
        7. Persist QC reports and recommendations
        8. Create initial version snapshot
        """
        logger.info(f"Starting lesson generation workflow for: '{req.title}'")

        # Step 1: Multi-source Research
        research_summary = await self.orchestrator.execute_research(
            title=req.title,
            learning_objective=req.learning_objective,
            target_level=req.target_level
        )

        # Step 2: AI Lesson Generation
        generated_lesson: GeneratedLessonStructure = await self.generator.generate_lesson(
            title=req.title,
            learning_objective=req.learning_objective,
            target_level=req.target_level,
            difficulty=req.difficulty,
            instructor_instructions=req.instructor_instructions,
            sources=research_summary.sources
        )

        # Step 3: Validate Duration
        if generated_lesson.total_estimated_duration_minutes > 45:
            logger.warning(f"Duration {generated_lesson.total_estimated_duration_minutes}m exceeds 45m. Normalizing.")
            sections_dict = [s.model_dump() for s in generated_lesson.sections]
            normalized_sections = validate_and_normalize_timings(sections_dict, max_limit=45)
            generated_lesson.total_estimated_duration_minutes = sum(s.get("estimated_minutes", 0) for s in normalized_sections)

        # Step 4: Persist Lesson
        lesson = Lesson(
            id=str(uuid.uuid4()),
            title=generated_lesson.title,
            learning_objective=generated_lesson.learning_objective,
            target_level=generated_lesson.target_audience or req.target_level,
            difficulty=req.difficulty,
            instructor_instructions=req.instructor_instructions,
            estimated_duration_minutes=generated_lesson.total_estimated_duration_minutes,
            status="IN_REVIEW"
        )
        db.add(lesson)
        db.flush()

        # Persist Sections
        db_sections = []
        for idx, sec in enumerate(generated_lesson.sections):
            section_record = LessonSection(
                id=str(uuid.uuid4()),
                lesson_id=lesson.id,
                section_type=sec.section_type,
                title=sec.title,
                content=sec.content,
                estimated_minutes=sec.estimated_minutes,
                order_index=idx
            )
            db.add(section_record)
            db_sections.append(section_record)

        # Persist Sources
        for src in research_summary.sources:
            source_record = ResearchSource(
                id=str(uuid.uuid4()),
                lesson_id=lesson.id,
                source_type=src.source_type,
                title=src.title,
                url=src.url,
                author_publisher=src.author_publisher,
                snippet=src.snippet,
                relevance_score=src.relevance_score,
                is_accessible=src.is_accessible,
                metadata_json=json.dumps(src.metadata),
                retrieved_at=src.retrieved_at
            )
            db.add(source_record)

        db.commit()

        # Step 5: Run Quality Control Layer 1 (Factual Accuracy)
        factual_result = await self.factual_qc.evaluate(
            lesson_id=lesson.id,
            lesson_title=lesson.title,
            learning_objective=lesson.learning_objective,
            sections=db_sections,
            sources=research_summary.sources
        )
        factual_report = FactualQCReport(
            id=str(uuid.uuid4()),
            lesson_id=lesson.id,
            audit_id=factual_result.audit_id,
            overall_status=factual_result.overall_status,
            accuracy_score=factual_result.accuracy_score,
            evaluation_summary=factual_result.evaluation_summary,
            verification_limitations=factual_result.verification_limitations,
            raw_report_json=factual_result.model_dump_json()
        )
        db.add(factual_report)

        # Persist Factual Recommendations
        for issue in factual_result.issues_identified:
            rec = QCRecommendation(
                id=str(uuid.uuid4()),
                lesson_id=lesson.id,
                qc_type="factual",
                audit_id=factual_result.audit_id,
                section_name=issue.affected_section,
                severity=issue.severity,
                issue_text=f"{issue.explanation} (Evidence: {issue.supporting_evidence})",
                original_text=issue.original_statement,
                recommended_fix=issue.recommended_correction,
                status="PENDING"
            )
            db.add(rec)

        # Step 6: Run Quality Control Layer 2 (Instructional Quality)
        inst_result = await self.instructional_qc.evaluate(
            lesson_id=lesson.id,
            lesson_title=lesson.title,
            learning_objective=lesson.learning_objective,
            target_level=lesson.target_level,
            total_minutes=lesson.estimated_duration_minutes,
            sections=db_sections
        )
        inst_report = InstructionalQCReport(
            id=str(uuid.uuid4()),
            lesson_id=lesson.id,
            audit_id=inst_result.audit_id,
            overall_status=inst_result.overall_status,
            pedagogical_score=inst_result.pedagogical_score,
            objective_alignment_assessment=inst_result.objective_alignment_assessment,
            clarity_assessment=inst_result.clarity_assessment,
            structure_assessment=inst_result.structure_assessment,
            example_quality=inst_result.example_quality,
            activity_quality=inst_result.activity_quality,
            assessment_quality=inst_result.assessment_quality,
            time_allocation_assessment=inst_result.time_allocation_assessment,
            summary=inst_result.summary,
            raw_report_json=inst_result.model_dump_json()
        )
        db.add(inst_report)

        # Persist Instructional Recommendations
        for issue in inst_result.issues_identified:
            rec = QCRecommendation(
                id=str(uuid.uuid4()),
                lesson_id=lesson.id,
                qc_type="instructional",
                audit_id=inst_result.audit_id,
                section_name=issue.affected_section,
                severity=issue.severity,
                issue_text=issue.explanation,
                original_text=issue.original_content,
                recommended_fix=issue.recommended_improvement,
                status="PENDING"
            )
            db.add(rec)

        # Step 7: Create Version 1 Snapshot
        snapshot_data = [
            {"id": s.id, "title": s.title, "section_type": s.section_type, "content": s.content, "estimated_minutes": s.estimated_minutes}
            for s in db_sections
        ]
        version = LessonVersion(
            id=str(uuid.uuid4()),
            lesson_id=lesson.id,
            version_number=1,
            title=lesson.title,
            snapshot_json=json.dumps(snapshot_data),
            change_description="Initial AI generation and QC audits"
        )
        db.add(version)

        db.commit()
        db.refresh(lesson)
        logger.info(f"Lesson creation workflow completed successfully: {lesson.id}")
        return lesson

    @staticmethod
    def get_lesson(db: Session, lesson_id: str) -> Lesson:
        lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if not lesson:
            raise ResourceNotFoundException("Lesson", lesson_id)
        return lesson

    @staticmethod
    def list_lessons(db: Session, search: Optional[str] = None, status_filter: Optional[str] = None) -> List[dict]:
        query = db.query(Lesson)
        if search:
            query = query.filter(Lesson.title.ilike(f"%{search}%") | Lesson.learning_objective.ilike(f"%{search}%"))
        if status_filter:
            query = query.filter(Lesson.status == status_filter)

        lessons = query.order_by(Lesson.created_at.desc()).all()
        result = []
        for l in lessons:
            latest_factual = db.query(FactualQCReport).filter(FactualQCReport.lesson_id == l.id).order_by(FactualQCReport.created_at.desc()).first()
            latest_instructional = db.query(InstructionalQCReport).filter(InstructionalQCReport.lesson_id == l.id).order_by(InstructionalQCReport.created_at.desc()).first()
            section_count = db.query(LessonSection).filter(LessonSection.lesson_id == l.id).count()
            source_count = db.query(ResearchSource).filter(ResearchSource.lesson_id == l.id).count()

            result.append({
                "id": l.id,
                "title": l.title,
                "learning_objective": l.learning_objective,
                "target_level": l.target_level,
                "difficulty": l.difficulty,
                "estimated_duration_minutes": l.estimated_duration_minutes,
                "status": l.status,
                "created_at": l.created_at,
                "updated_at": l.updated_at,
                "section_count": section_count,
                "source_count": source_count,
                "factual_qc_status": latest_factual.overall_status if latest_factual else None,
                "instructional_qc_status": latest_instructional.overall_status if latest_instructional else None
            })
        return result

    @staticmethod
    def update_lesson(db: Session, lesson_id: str, update_in: LessonUpdateRequest) -> Lesson:
        """Update lesson fields and sections, preserving changes in version history."""
        lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if not lesson:
            raise ResourceNotFoundException("Lesson", lesson_id)

        if update_in.title is not None:
            lesson.title = update_in.title
        if update_in.learning_objective is not None:
            lesson.learning_objective = update_in.learning_objective
        if update_in.target_level is not None:
            lesson.target_level = update_in.target_level
        if update_in.difficulty is not None:
            lesson.difficulty = update_in.difficulty
        if update_in.status is not None:
            lesson.status = update_in.status
        if update_in.instructor_instructions is not None:
            lesson.instructor_instructions = update_in.instructor_instructions

        if update_in.sections is not None:
            total_time = sum(s.estimated_minutes for s in update_in.sections)
            if total_time > 45:
                raise DurationValidationException(total_time, max_allowed=45)

            lesson.estimated_duration_minutes = total_time
            # Update or replace sections
            # Map existing sections
            existing_sections = {s.id: s for s in lesson.sections}
            for sec_data in update_in.sections:
                if sec_data.id and sec_data.id in existing_sections:
                    sec = existing_sections[sec_data.id]
                    sec.title = sec_data.title
                    sec.content = sec_data.content
                    sec.estimated_minutes = sec_data.estimated_minutes
                    sec.order_index = sec_data.order_index
                    sec.section_type = sec_data.section_type
                else:
                    new_sec = LessonSection(
                        id=str(uuid.uuid4()),
                        lesson_id=lesson.id,
                        section_type=sec_data.section_type,
                        title=sec_data.title,
                        content=sec_data.content,
                        estimated_minutes=sec_data.estimated_minutes,
                        order_index=sec_data.order_index
                    )
                    db.add(new_sec)

        lesson.updated_at = datetime.now(timezone.utc)

        # Record version
        current_v_count = db.query(LessonVersion).filter(LessonVersion.lesson_id == lesson.id).count()
        current_sections = db.query(LessonSection).filter(LessonSection.lesson_id == lesson.id).order_by(LessonSection.order_index).all()
        snapshot = [
            {"id": s.id, "title": s.title, "section_type": s.section_type, "content": s.content, "estimated_minutes": s.estimated_minutes}
            for s in current_sections
        ]
        version = LessonVersion(
            id=str(uuid.uuid4()),
            lesson_id=lesson.id,
            version_number=current_v_count + 1,
            title=lesson.title,
            snapshot_json=json.dumps(snapshot),
            change_description=update_in.change_description or "Instructor revision"
        )
        db.add(version)
        db.commit()
        db.refresh(lesson)
        return lesson

    @staticmethod
    def delete_lesson(db: Session, lesson_id: str) -> bool:
        lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if not lesson:
            raise ResourceNotFoundException("Lesson", lesson_id)
        db.delete(lesson)
        db.commit()
        return True

    async def rerun_qc(self, db: Session, lesson_id: str, qc_type: str = "both") -> dict:
        """Rerun QC Layer 1 (Factual), Layer 2 (Instructional), or both against the latest lesson content."""
        lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if not lesson:
            raise ResourceNotFoundException("Lesson", lesson_id)

        sections = db.query(LessonSection).filter(LessonSection.lesson_id == lesson.id).order_by(LessonSection.order_index).all()
        sources = db.query(ResearchSource).filter(ResearchSource.lesson_id == lesson.id).all()

        results = {}

        if qc_type in ["factual", "both"]:
            factual_result = await self.factual_qc.evaluate(
                lesson_id=lesson.id,
                lesson_title=lesson.title,
                learning_objective=lesson.learning_objective,
                sections=sections,
                sources=sources
            )
            factual_report = FactualQCReport(
                id=str(uuid.uuid4()),
                lesson_id=lesson.id,
                audit_id=factual_result.audit_id,
                overall_status=factual_result.overall_status,
                accuracy_score=factual_result.accuracy_score,
                evaluation_summary=factual_result.evaluation_summary,
                verification_limitations=factual_result.verification_limitations,
                raw_report_json=factual_result.model_dump_json()
            )
            db.add(factual_report)
            for issue in factual_result.issues_identified:
                rec = QCRecommendation(
                    id=str(uuid.uuid4()),
                    lesson_id=lesson.id,
                    qc_type="factual",
                    audit_id=factual_result.audit_id,
                    section_name=issue.affected_section,
                    severity=issue.severity,
                    issue_text=f"{issue.explanation} (Evidence: {issue.supporting_evidence})",
                    original_text=issue.original_statement,
                    recommended_fix=issue.recommended_correction,
                    status="PENDING"
                )
                db.add(rec)
            results["factual"] = factual_result.model_dump()

        if qc_type in ["instructional", "both"]:
            inst_result = await self.instructional_qc.evaluate(
                lesson_id=lesson.id,
                lesson_title=lesson.title,
                learning_objective=lesson.learning_objective,
                target_level=lesson.target_level,
                total_minutes=lesson.estimated_duration_minutes,
                sections=sections
            )
            inst_report = InstructionalQCReport(
                id=str(uuid.uuid4()),
                lesson_id=lesson.id,
                audit_id=inst_result.audit_id,
                overall_status=inst_result.overall_status,
                pedagogical_score=inst_result.pedagogical_score,
                objective_alignment_assessment=inst_result.objective_alignment_assessment,
                clarity_assessment=inst_result.clarity_assessment,
                structure_assessment=inst_result.structure_assessment,
                example_quality=inst_result.example_quality,
                activity_quality=inst_result.activity_quality,
                assessment_quality=inst_result.assessment_quality,
                time_allocation_assessment=inst_result.time_allocation_assessment,
                summary=inst_result.summary,
                raw_report_json=inst_result.model_dump_json()
            )
            db.add(inst_report)
            for issue in inst_result.issues_identified:
                rec = QCRecommendation(
                    id=str(uuid.uuid4()),
                    lesson_id=lesson.id,
                    qc_type="instructional",
                    audit_id=inst_result.audit_id,
                    section_name=issue.affected_section,
                    severity=issue.severity,
                    issue_text=issue.explanation,
                    original_text=issue.original_content,
                    recommended_fix=issue.recommended_improvement,
                    status="PENDING"
                )
                db.add(rec)
            results["instructional"] = inst_result.model_dump()

        db.commit()
        return results

