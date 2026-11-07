# REST API Documentation

## AI-Powered Lesson Creation & Research Platform

Base URL: `http://127.0.0.1:8000`
Interactive Swagger Docs: `http://127.0.0.1:8000/docs`
ReDoc Interface: `http://127.0.0.1:8000/redoc`

---

## 1. Health & Dashboard Statistics

### `GET /api/health`
Checks the operating status and active external API integrations.

**Response `200 OK`**:
```json
{
  "status": "healthy",
  "app": "AI-Powered Lesson Creation & Research Platform",
  "version": "1.0.0",
  "environment": "development",
  "gemini_model": "gemini-2.5-flash",
  "gemini_configured": true,
  "tavily_configured": false,
  "youtube_configured": false
}
```

### `GET /api/stats`
Retrieves platform-wide overview metrics for the dashboard.

**Response `200 OK`**:
```json
{
  "total_lessons": 12,
  "completed_lessons": 8,
  "in_review_lessons": 3,
  "draft_lessons": 1,
  "average_factual_score": 95.2,
  "average_pedagogical_score": 93.4,
  "recent_lessons": [...],
  "recent_activities": [...]
}
```

---

## 2. Lesson Management

### `POST /api/lessons/generate`
Generates a complete, researched, 45-minute lesson and runs dual QC audits.

**Request Body**:
```json
{
  "title": "HTTP Requests and Responses",
  "learning_objective": "Explain GET and POST methods and distinguish between 2xx, 4xx, and 5xx response status categories.",
  "target_level": "Beginner",
  "difficulty": "Intermediate",
  "instructor_instructions": "Include browser DevTools inspection exercise."
}
```

**Response `201 Created`**:
```json
{
  "success": true,
  "message": "Lesson 'HTTP Requests and Responses' generated, researched, and audited successfully.",
  "data": {
    "lesson_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "title": "HTTP Requests and Responses",
    "duration": 45
  }
}
```

### `GET /api/lessons`
Lists all saved lessons with search and status filtering.

**Query Parameters**:
- `search` (string, optional): Search keyword against title or objective.
- `status` (string, optional): Filter by `DRAFT`, `IN_REVIEW`, or `COMPLETED`.

### `GET /api/lessons/{lesson_id}`
Retrieves full details of a single lesson including all sections and research sources.

### `PUT /api/lessons/{lesson_id}`
Updates lesson metadata or sections. Re-validates the strict 45-minute limit and creates an immutable version history snapshot.

### `DELETE /api/lessons/{lesson_id}`
Deletes a lesson and all cascading relational records (sections, sources, QC reports, exports).

---

## 3. Research Retrieval

### `POST /api/research`
Ad-hoc multi-source research endpoint across Tavily, YouTube Data API, and Google Books.

### `GET /api/research/lessons/{lesson_id}/sources`
Retrieves all normalized research sources for a specific lesson.

---

## 4. Quality Control & Auditing

### `GET /api/lessons/{lesson_id}/qc`
Returns both Layer 1 (Factual Accuracy) and Layer 2 (Instructional Quality) audit reports.

### `POST /api/lessons/{lesson_id}/qc/factual`
Re-runs Quality Control Layer 1 (Factual Accuracy) against the current lesson content.

### `POST /api/lessons/{lesson_id}/qc/instructional`
Re-runs Quality Control Layer 2 (Instructional Quality) against the current lesson content.

---

## 5. QC Recommendations & Human-in-the-Loop Review

### `GET /api/lessons/{lesson_id}/recommendations`
Retrieves all pending and applied QC recommendations.

### `POST /api/recommendations/{recommendation_id}/apply`
Applies a recommendation to the affected section. Supports optional custom instructor text overrides.

**Request Body**:
```json
{
  "edited_fix": "Optional instructor-modified replacement text"
}
```

### `POST /api/recommendations/{recommendation_id}/reject`
Marks the recommendation as rejected.

---

## 6. Document Generation & Exports

### `GET /api/lessons/{lesson_id}/preview`
Retrieves full aggregated preview data for the lesson.

### `GET /api/lessons/{lesson_id}/export/pdf`
Downloads the formatted Lesson PDF (ReportLab).

### `GET /api/lessons/{lesson_id}/export/qc/factual`
Downloads the Factual Accuracy QC Audit PDF (ReportLab).

### `GET /api/lessons/{lesson_id}/export/qc/instructional`
Downloads the Instructional Quality QC Audit PDF (ReportLab).

### `GET /api/lessons/{lesson_id}/export/json`
Downloads the comprehensive lesson package in JSON.

