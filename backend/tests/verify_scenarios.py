import sys
import os
import asyncio
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database.connection import SessionLocal, init_db
from app.database.models import Lesson, LessonSection, ResearchSource, FactualQCReport, InstructionalQCReport, QCRecommendation, LessonVersion, ExportRecord
from app.services.lesson_service import LessonService
from app.services.qc_service import QCService
from app.services.export_service import ExportService
from app.schemas.lesson import LessonCreateRequest, LessonUpdateRequest

async def run_scenario_1():
    print("\n" + "="*80)
    print("RUNNING TEST SCENARIO 1: HTTP REQUESTS AND RESPONSES")
    print("="*80)

    init_db()
    db = SessionLocal()
    service = LessonService()

    req = LessonCreateRequest(
        title="HTTP Requests and Responses",
        learning_objective="Explain GET and POST methods and distinguish between 2xx, 4xx, and 5xx response status categories.",
        target_level="Beginner Web Developers",
        difficulty="Intermediate",
        instructor_instructions="Include browser DevTools inspection exercise and REST API examples."
    )

    # 1. Generate & Research
    print("[1/6] Orchestrating multi-source research & generating 45-min lesson...")
    lesson = await service.create_and_generate_lesson(db, req)
    print(f"      Lesson Created: ID={lesson.id}, Title='{lesson.title}'")
    print(f"      Duration: {lesson.estimated_duration_minutes} minutes (<= 45 min constraint verified: {lesson.estimated_duration_minutes <= 45})")

    # 2. Check Sources
    sources = db.query(ResearchSource).filter(ResearchSource.lesson_id == lesson.id).all()
    print(f"[2/6] Retrieved & Normalized Sources: {len(sources)}")
    for s in sources:
        print(f"      - [{s.source_type.upper()}] {s.title} ({s.url})")
    assert len(sources) >= 3, "Expected at least 3 research sources"

    # 3. Check Dual QC Reports
    print("[3/6] Inspecting Independent Dual Quality Control Reports...")
    factual = db.query(FactualQCReport).filter(FactualQCReport.lesson_id == lesson.id).first()
    instructional = db.query(InstructionalQCReport).filter(InstructionalQCReport.lesson_id == lesson.id).first()
    print(f"      QC Layer 1 (Factual Accuracy): Status={factual.overall_status}, Score={factual.accuracy_score}%")
    print(f"      QC Layer 2 (Instructional Quality): Status={instructional.overall_status}, Score={instructional.pedagogical_score}%")
    assert factual is not None and instructional is not None, "Both QC layers must exist separately"

    # 4. Check & Apply Recommendations
    print("[4/6] Inspecting QC Recommendations & Applying Human-in-the-Loop Fix...")
    recs = db.query(QCRecommendation).filter(QCRecommendation.lesson_id == lesson.id).all()
    print(f"      Total Recommendations: {len(recs)}")
    if recs:
        target_rec = recs[0]
        print(f"      Applying Recommendation: ID={target_rec.id}, Type={target_rec.qc_type}, Section={target_rec.section_name}")
        apply_res = QCService.apply_recommendation(db, target_rec.id)
        print(f"      Apply Result: {apply_res['status']} - {apply_res['message']}")
        assert apply_res["success"] is True

    # 5. Instructor Edit & Version Snapshot
    print("[5/6] Simulating Instructor Content Edit & Version Snapshot...")
    sections = db.query(LessonSection).filter(LessonSection.lesson_id == lesson.id).all()
    if sections:
        first_sec = sections[0]
        update_req = LessonUpdateRequest(
            title=lesson.title,
            instructor_instructions="Updated instructor note: Verified in live classroom session.",
            change_description="Instructor post-QC review update"
        )
        LessonService.update_lesson(db, lesson.id, update_req)
        versions = db.query(LessonVersion).filter(LessonVersion.lesson_id == lesson.id).all()
        print(f"      Version Snapshots Preserved: {len(versions)}")
        assert len(versions) >= 2, "Expected at least 2 versions after edits"

    # 6. Generate All PDF & JSON Exports
    print("[6/6] Generating ReportLab PDFs and JSON Package Exports...")
    pdf_lesson = ExportService.export_lesson_pdf(db, lesson.id)
    pdf_factual = ExportService.export_factual_qc_pdf(db, lesson.id)
    pdf_inst = ExportService.export_instructional_qc_pdf(db, lesson.id)
    json_pkg = ExportService.export_json_package(db, lesson.id)

    print(f"      Generated Lesson PDF: {pdf_lesson} (Size: {os.path.getsize(pdf_lesson)} bytes)")
    print(f"      Generated Factual QC PDF: {pdf_factual} (Size: {os.path.getsize(pdf_factual)} bytes)")
    print(f"      Generated Instructional QC PDF: {pdf_inst} (Size: {os.path.getsize(pdf_inst)} bytes)")
    print(f"      Generated JSON Package: {json_pkg} (Size: {os.path.getsize(json_pkg)} bytes)")

    assert os.path.exists(pdf_lesson) and os.path.getsize(pdf_lesson) > 1000
    assert os.path.exists(pdf_factual) and os.path.getsize(pdf_factual) > 1000
    assert os.path.exists(pdf_inst) and os.path.getsize(pdf_inst) > 1000
    assert os.path.exists(json_pkg) and os.path.getsize(json_pkg) > 500

    print(">>> SCENARIO 1 COMPLETED AND VERIFIED SUCCESSFULLY! <<<\n")
    db.close()

async def run_scenario_2():
    print("\n" + "="*80)
    print("RUNNING TEST SCENARIO 2: INTRODUCTION TO MACHINE LEARNING")
    print("="*80)

    init_db()
    db = SessionLocal()
    service = LessonService()

    req = LessonCreateRequest(
        title="Introduction to Machine Learning and Supervised Learning",
        learning_objective="Understand the fundamentals of machine learning, distinguish between supervised and unsupervised learning, and explain classification and regression using practical examples.",
        target_level="Introductory Data Science Students",
        difficulty="Intermediate",
        instructor_instructions="Include Scikit-Learn code snippets for both regression and classification."
    )

    # 1. Generate & Research
    print("[1/6] Orchestrating multi-source research & generating 45-min lesson...")
    lesson = await service.create_and_generate_lesson(db, req)
    print(f"      Lesson Created: ID={lesson.id}, Title='{lesson.title}'")
    print(f"      Duration: {lesson.estimated_duration_minutes} minutes (<= 45 min constraint verified: {lesson.estimated_duration_minutes <= 45})")

    # 2. Check Sources
    sources = db.query(ResearchSource).filter(ResearchSource.lesson_id == lesson.id).all()
    print(f"[2/6] Retrieved & Normalized Sources: {len(sources)}")
    for s in sources:
        print(f"      - [{s.source_type.upper()}] {s.title} ({s.url})")
    assert len(sources) >= 3, "Expected at least 3 research sources"

    # 3. Check Dual QC Reports
    print("[3/6] Inspecting Independent Dual Quality Control Reports...")
    factual = db.query(FactualQCReport).filter(FactualQCReport.lesson_id == lesson.id).first()
    instructional = db.query(InstructionalQCReport).filter(InstructionalQCReport.lesson_id == lesson.id).first()
    print(f"      QC Layer 1 (Factual Accuracy): Status={factual.overall_status}, Score={factual.accuracy_score}%")
    print(f"      QC Layer 2 (Instructional Quality): Status={instructional.overall_status}, Score={instructional.pedagogical_score}%")
    assert factual is not None and instructional is not None, "Both QC layers must exist separately"

    # 4. Check & Apply Recommendations
    print("[4/6] Inspecting QC Recommendations & Applying Human-in-the-Loop Fix...")
    recs = db.query(QCRecommendation).filter(QCRecommendation.lesson_id == lesson.id).all()
    print(f"      Total Recommendations: {len(recs)}")
    if recs:
        target_rec = recs[0]
        print(f"      Applying Recommendation: ID={target_rec.id}, Type={target_rec.qc_type}, Section={target_rec.section_name}")
        apply_res = QCService.apply_recommendation(db, target_rec.id)
        print(f"      Apply Result: {apply_res['status']} - {apply_res['message']}")
        assert apply_res["success"] is True

    # 5. Instructor Edit & Version Snapshot
    print("[5/6] Simulating Instructor Content Edit & Version Snapshot...")
    update_req = LessonUpdateRequest(
        title=lesson.title,
        status="COMPLETED",
        change_description="Approved after statistical rigor review"
    )
    LessonService.update_lesson(db, lesson.id, update_req)
    versions = db.query(LessonVersion).filter(LessonVersion.lesson_id == lesson.id).all()
    print(f"      Version Snapshots Preserved: {len(versions)}")
    assert len(versions) >= 2, "Expected at least 2 versions after edits"

    # 6. Generate All PDF & JSON Exports
    print("[6/6] Generating ReportLab PDFs and JSON Package Exports...")
    pdf_lesson = ExportService.export_lesson_pdf(db, lesson.id)
    pdf_factual = ExportService.export_factual_qc_pdf(db, lesson.id)
    pdf_inst = ExportService.export_instructional_qc_pdf(db, lesson.id)
    json_pkg = ExportService.export_json_package(db, lesson.id)

    print(f"      Generated Lesson PDF: {pdf_lesson} (Size: {os.path.getsize(pdf_lesson)} bytes)")
    print(f"      Generated Factual QC PDF: {pdf_factual} (Size: {os.path.getsize(pdf_factual)} bytes)")
    print(f"      Generated Instructional QC PDF: {pdf_inst} (Size: {os.path.getsize(pdf_inst)} bytes)")
    print(f"      Generated JSON Package: {json_pkg} (Size: {os.path.getsize(json_pkg)} bytes)")

    assert os.path.exists(pdf_lesson) and os.path.getsize(pdf_lesson) > 1000
    assert os.path.exists(pdf_factual) and os.path.getsize(pdf_factual) > 1000
    assert os.path.exists(pdf_inst) and os.path.getsize(pdf_inst) > 1000
    assert os.path.exists(json_pkg) and os.path.getsize(json_pkg) > 500

    print(">>> SCENARIO 2 COMPLETED AND VERIFIED SUCCESSFULLY! <<<\n")
    db.close()

async def main():
    await run_scenario_1()
    await run_scenario_2()

if __name__ == "__main__":
    asyncio.run(main())

