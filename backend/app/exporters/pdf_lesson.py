import os
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        # Header
        self.drawString(54, 755, "AI-Powered Lesson Creation & Research Platform | Kalvium AI Research Intern Evaluation")
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 747, 558, 747)
        # Footer
        self.line(54, 45, 558, 45)
        self.drawString(54, 32, "Confidential & Educational Use | Generated with Gemini AI")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 32, page_text)
        self.restoreState()

def generate_lesson_pdf(lesson_data: dict, output_path: str) -> str:
    """Generate a clean, professional educational Lesson PDF using ReportLab."""
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=64,
        bottomMargin=60
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'LessonTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=8
    )
    subtitle_style = ParagraphStyle(
        'LessonSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#334155"),
        spaceAfter=14
    )
    meta_box_style = ParagraphStyle(
        'MetaBoxText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1e293b")
    )
    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor("#1e40af"),
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )
    body_style = ParagraphStyle(
        'SectionBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor("#1e293b"),
        spaceAfter=8
    )
    code_style = ParagraphStyle(
        'CodeBlock',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#0f172a"),
        backColor=colors.HexColor("#f1f5f9"),
        borderPadding=6,
        spaceBefore=4,
        spaceAfter=8
    )

    story = []

    # Title Banner
    story.append(Paragraph(lesson_data.get("title", "Educational Lesson"), title_style))
    story.append(Paragraph(f"<b>Learning Objective:</b> {lesson_data.get('learning_objective', '')}", subtitle_style))

    # Metadata Summary Table
    meta_data = [
        [
            Paragraph(f"<b>Target Level:</b> {lesson_data.get('target_level', 'Beginner')}", meta_box_style),
            Paragraph(f"<b>Difficulty:</b> {lesson_data.get('difficulty', 'Intermediate')}", meta_box_style),
            Paragraph(f"<b>Est. Duration:</b> {lesson_data.get('estimated_duration_minutes', 45)} mins (Max: 45m)", meta_box_style),
            Paragraph(f"<b>Status:</b> {lesson_data.get('status', 'COMPLETED')}", meta_box_style),
        ]
    ]
    meta_table = Table(meta_data, colWidths=[120, 120, 140, 124])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # Render Sections
    sections = lesson_data.get("sections", [])
    for sec in sections:
        sec_title = sec.get("title", "")
        sec_mins = sec.get("estimated_minutes", 0)
        mins_text = f" ({sec_mins} mins)" if sec_mins > 0 else ""
        story.append(Paragraph(f"{sec_title}{mins_text}", h1_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e1"), spaceBefore=2, spaceAfter=6))

        content = sec.get("content", "")
        # Break content into lines/paragraphs or code blocks
        lines = content.split("\n\n")
        for chunk in lines:
            chunk = chunk.strip()
            if not chunk:
                continue
            if chunk.startswith("```"):
                code_text = chunk.replace("```python", "").replace("```json", "").replace("```", "").strip()
                code_text = code_text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br/>")
                story.append(Paragraph(code_text, code_style))
            else:
                formatted_chunk = chunk.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                # Bold markers **text**
                import re
                formatted_chunk = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', formatted_chunk)
                formatted_chunk = formatted_chunk.replace("\n", "<br/>")
                story.append(Paragraph(formatted_chunk, body_style))
        story.append(Spacer(1, 6))

    doc.build(story, canvasmaker=NumberedCanvas)
    return output_path

