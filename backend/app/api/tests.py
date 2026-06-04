from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.agents.workflow import RedTeamWorkflow
from app.core.security import get_current_user, looks_like_prompt_injection
from app.db.session import get_db
from app.models.entities import AttackPrompt, Report, TestRun, User
from app.reports.generator import generate_reports
from app.schemas.dto import TestRunIn, TestRunOut
from app.services.audit import audit

router = APIRouter(prefix="/tests", tags=["tests"])


@router.post("/run", response_model=TestRunOut)
async def run_test(payload: TestRunIn, request: Request, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(AttackPrompt)
    if payload.categories:
        query = query.filter(AttackPrompt.category.in_(payload.categories))
    prompts = [
        {
            "name": item.name,
            "category": item.category,
            "severity": item.severity,
            "prompt": item.prompt,
            "guardrail_hint": item.guardrail_hint,
        }
        for item in query.all()
    ]
    injection_detected = looks_like_prompt_injection(payload.policy)
    result = await RedTeamWorkflow().run(payload.target_model, str(payload.target_url), payload.policy, prompts)
    if injection_detected:
        result["risk_score"] = min(100, result["risk_score"] + 12)
        result["details"]["input_validation"] = "Prompt injection markers detected in submitted policy."
    test = TestRun(owner_id=user.id, policy=payload.policy, **result)
    db.add(test)
    db.commit()
    db.refresh(test)
    pdf_path, docx_path = generate_reports(test)
    db.add(Report(owner_id=user.id, test_run_id=test.id, title=f"Guardrail Report - {test.target_model}", pdf_path=pdf_path, docx_path=docx_path))
    audit(db, "tests.run", user, request, test_run_id=test.id, risk=test.risk_score)
    db.commit()
    return test


@router.get("/history", response_model=list[TestRunOut])
def history(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(TestRun).filter(TestRun.owner_id == user.id).order_by(TestRun.created_at.desc()).all()
