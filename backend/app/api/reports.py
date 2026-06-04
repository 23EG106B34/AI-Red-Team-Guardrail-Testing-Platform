from fastapi import APIRouter, Depends
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from app.core.security import get_current_user
from app.db.session import get_db
from app.models.entities import Report, User
from app.reports.generator import public_url
from app.schemas.dto import ReportOut

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("", response_model=list[ReportOut])
def list_reports(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    reports = db.query(Report).filter(Report.owner_id == user.id).order_by(Report.created_at.desc()).all()
    return [
        ReportOut(
            id=report.id,
            test_run_id=report.test_run_id,
            title=report.title,
            pdf_url=public_url(report.pdf_path),
            docx_url=public_url(report.docx_path),
            created_at=report.created_at,
        )
        for report in reports
    ]
