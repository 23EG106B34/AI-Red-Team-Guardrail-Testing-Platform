from pathlib import Path
from docx import Document
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from app.core.config import get_settings
from app.models.entities import TestRun


def generate_reports(test: TestRun) -> tuple[str, str]:
    output = Path("reports/generated")
    output.mkdir(parents=True, exist_ok=True)
    pdf_path = output / f"{test.id}.pdf"
    docx_path = output / f"{test.id}.docx"

    pdf = canvas.Canvas(str(pdf_path), pagesize=letter)
    pdf.setTitle(f"AI Red-Team Report {test.id}")
    pdf.drawString(72, 740, "Sentinel Red AI - Guardrail Test Report")
    pdf.drawString(72, 710, f"Model: {test.target_model}")
    pdf.drawString(72, 690, f"Risk Score: {test.risk_score}/100")
    pdf.drawString(72, 670, f"Attack Success Rate: {test.attack_success_rate}%")
    pdf.drawString(72, 650, f"Recommendation: {test.recommendation[:92]}")
    y = 610
    for finding in test.details.get("findings", [])[:8]:
        pdf.drawString(72, y, f"- {finding['category']}: {finding['finding']}")
        y -= 20
    pdf.save()

    doc = Document()
    doc.add_heading("Sentinel Red AI - Guardrail Test Report", level=1)
    doc.add_paragraph(f"Model: {test.target_model}")
    doc.add_paragraph(f"Risk Score: {test.risk_score}/100")
    doc.add_paragraph(f"Attack Success Rate: {test.attack_success_rate}%")
    doc.add_heading("Defense Recommendation", level=2)
    doc.add_paragraph(test.recommendation)
    doc.add_heading("Findings", level=2)
    for finding in test.details.get("findings", []):
        doc.add_paragraph(f"{finding['category']}: {finding['finding']}", style="List Bullet")
    doc.save(str(docx_path))
    return str(pdf_path), str(docx_path)


def public_url(path: str) -> str:
    settings = get_settings()
    return f"{settings.report_base_url}/static/{Path(path).name}"
