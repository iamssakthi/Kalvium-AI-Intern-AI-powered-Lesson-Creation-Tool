import pytest
import uuid
from app.database.models import Lesson, LessonSection, ResearchSource, FactualQCReport, InstructionalQCReport
from app.services.lesson_service import LessonService
from app.schemas.lesson import LessonUpdateRequest, SectionCreateOrUpdate

def test_lesson_persistence_and_versioning(db_session):
    lesson_id = str(uuid.uuid4())
    lesson = Lesson(
        id=lesson_id,
        title="Original Title",
        learning_objective="Original Objective",
        estimated_duration_minutes=35,
        status="DRAFT"
    )
    db_session.add(lesson)

    sec = LessonSection(
        id=str(uuid.uuid4()),
        lesson_id=lesson_id,
        section_type="introduction",
        title="Intro",
        content="Intro text",
        estimated_minutes=5,
        order_index=0
    )
    db_session.add(sec)
    db_session.commit()

    # Update lesson
    update_data = LessonUpdateRequest(
        title="Updated Lesson Title",
        sections=[
            SectionCreateOrUpdate(
                id=sec.id,
                section_type="introduction",
                title="Intro Revised",
                content="Updated intro text",
                estimated_minutes=7,
                order_index=0
            )
        ],
        change_description="Updated intro section"
    )

    updated_lesson = LessonService.update_lesson(db_session, lesson_id, update_data)
    assert updated_lesson.title == "Updated Lesson Title"
    assert updated_lesson.estimated_duration_minutes == 7

    # Check version history preserved
    assert len(updated_lesson.versions) == 1
    assert updated_lesson.versions[0].version_number == 1
    assert "Updated intro section" in updated_lesson.versions[0].change_description

