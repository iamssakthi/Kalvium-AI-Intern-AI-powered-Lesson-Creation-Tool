import os
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.pdfgen import canvas
import re

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
        self.drawString(54, 755, "QC Audit Layer 1: Research & Factual Accuracy | Kalvium AI Research Evaluation")
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 747, 558, 747)
        self.line(54, 45, 558, 45)
        self.drawString(54, 32, "Confidential Quality Audit Report | Independent Verification Engine")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 32, page_text)
        self.restoreState()

def generate_factual_qc_pdf(report_data: dict, lesson_title: str, output_path: str) -> str:
    """Generate a formal Factual Accuracy QC Audit PDF Report using ReportLab."""
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

    title_style = ParagraphStyle(
        'AuditTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        'AuditSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#475569"),
        spaceAfter=12
    )
    h2_style = ParagraphStyle(
        'AuditH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#0369a1"),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )
    body_style = ParagraphStyle(
        'AuditBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=colors.HexColor("#1e293b"),
        spaceAfter=6
    )
    table_text = ParagraphStyle(
        'TableText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor("#1e293b")
    )
    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor("#ffffff")
    )

    story = []

    # Title & Header
    story.append(Paragraph("Quality Control Layer 1: Research & Factual Accuracy Audit", title_style))
    story.append(Paragraph(f"<b>Lesson:</b> {lesson_title} | <b>Audit Reference:</b> {report_data.get('audit_id', 'N/A')}", subtitle_style))

    # Audit Score Box
    status = report_data.get("overall_status", "PASS")
    score = report_data.get("accuracy_score", 95.0)
    status_bg = "#dcfce7" if status == "PASS" else ("#fef9c3" if status == "NEEDS IMPROVEMENT" else "#fee2e2")
    status_fg = "#166534" if status == "PASS" else ("#854d0e" if status == "NEEDS IMPROVEMENT" else "#991b1b")

    summary_table_data = [
        [
            Paragraph(f"<b>Overall Audit Status:</b> <font color='{status_fg}'><b>{status}</b></font>", body_style),
            Paragraph(f"<b>Factual Accuracy Score:</b> {score:.1f}%", body_style),
            Paragraph(f"<b>Issues Detected:</b> {len(report_data.get('issues_identified', []))}", body_style)
        ]
    ]
    summary_table = Table(summary_table_data, colWidths=[180, 160, 164])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor(status_bg)),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor(status_fg)),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 10))

    # Executive Evaluation Summary
    story.append(Paragraph("1. Executive Accuracy Assessment", h2_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e1"), spaceBefore=2, spaceAfter=6))
    story.append(Paragraph(report_data.get("evaluation_summary", ""), body_style))

    # Issues and Corrections Table
    issues = report_data.get("issues_identified", [])
    story.append(Spacer(1, 6))
    story.append(Paragraph(f"2. Factual Claims Analysis & Corrections ({len(issues)} item{'s' if len(issues) != 1 else ''})", h2_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e1"), spaceBefore=2, spaceAfter=6))

    if issues:
        table_rows = [
            [
                Paragraph("<b>ID / Severity</b>", table_header),
                Paragraph("<b>Affected Section & Claim</b>", table_header),
                Paragraph("<b>Audit Finding & Supporting Evidence</b>", table_header),
                Paragraph("<b>Recommended Correction</b>", table_header)
            ]
        ]
        for itm in issues:
            sev = itm.get("severity", "MEDIUM")
            iss_id = itm.get("issue_id", "")
            sec = itm.get("affected_section", "")
            claim = itm.get("original_statement", "")
            exp = itm.get("explanation", "")
            evid = itm.get("supporting_evidence", "")
            fix = itm.get("recommended_correction", "")

            table_rows.append([
                Paragraph(f"<b>{iss_id}</b><br/><font color='#dc2626'>{sev}</font>", table_text),
                Paragraph(f"<b>Section:</b> {sec}<br/><br/><i>\"{claim}\"</i>", table_text),
                Paragraph(f"{exp}<br/><br/><b>Evidence:</b> {evid}", table_text),
                Paragraph(f"<b>Fix:</b> {fix}", table_text)
            ])

        issue_table = Table(table_rows, colWidths=[70, 140, 150, 144])
        issue_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f172a")),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('LEFTPADDING', (0,0), (-1,-1), 6),
            ('RIGHTPADDING', (0,0), (-1,-1), 6),
            ('VALIGN', (0,0), (-1,-1), 'TOP')
        ]))
        story.append(issue_table)
    else:
        story.append(Paragraph("<i>No factual discrepancies or unverified claims detected. All assertions are backed by authoritative citations.</i>", body_style))

    # Verification Limitations & Traceability
    story.append(Spacer(1, 10))
    story.append(Paragraph("3. Verification Scope & Limitations", h2_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e1"), spaceBefore=2, spaceAfter=6))
    limitations = report_data.get("verification_limitations", "Full citation and source tracing applied.")
    story.append(Paragraph(limitations, body_style))

    # Summary Conclusion
    story.append(Spacer(1, 6))
    story.append(Paragraph("4. Conclusion & Certification", h2_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e1"), spaceBefore=2, spaceAfter=6))
    story.append(Paragraph(report_data.get("summary", ""), body_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    return output_path

