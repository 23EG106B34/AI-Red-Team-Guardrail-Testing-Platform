from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.core.security import require_roles
from app.db.session import get_db
from app.models.entities import ApiKey, AttackPrompt, AuditLog, Report, Role, TestRun, User
from app.schemas.dto import UserOut

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[UserOut])
def users(_: User = Depends(require_roles(Role.admin)), db: Session = Depends(get_db)):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.get("/system")
def system(_: User = Depends(require_roles(Role.admin)), db: Session = Depends(get_db)):
    return {
        "users": db.query(User).count(),
        "tests": db.query(TestRun).count(),
        "reports": db.query(Report).count(),
        "attack_prompts": db.query(AttackPrompt).count(),
        "api_keys": db.query(ApiKey).count(),
        "audit_events": db.query(AuditLog).count(),
        "average_risk": round(db.query(func.avg(TestRun.risk_score)).scalar() or 0, 2),
    }


@router.get("/audit")
def audit_events(_: User = Depends(require_roles(Role.admin)), db: Session = Depends(get_db)):
    events = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(100).all()
    return [
        {
            "id": event.id,
            "actor_id": event.actor_id,
            "action": event.action,
            "metadata": event.metadata_json,
            "ip_address": event.ip_address,
            "created_at": event.created_at,
        }
        for event in events
    ]
