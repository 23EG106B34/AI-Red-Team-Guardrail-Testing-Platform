from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.security import get_current_user
from app.db.session import get_db
from app.models.entities import TestRun, User

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary")
def summary(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tests = db.query(TestRun).filter(TestRun.owner_id == user.id).order_by(TestRun.created_at.asc()).all()
    total = len(tests)
    cost = round(sum(item.estimated_cost for item in tests), 2)
    average_risk = round(sum(item.risk_score for item in tests) / max(total, 1), 1)
    critical = sum(1 for item in tests if item.risk_score >= 80)
    if tests:
        trends = [
            {
                "date": item.created_at.strftime("%b %d"),
                "risk": item.risk_score,
                "success": item.attack_success_rate,
                "hallucination": item.hallucination_rate,
                "latency": item.latency_ms,
            }
            for item in tests[-14:]
        ]
    else:
        base = datetime.utcnow() - timedelta(days=6)
        trends = [{"date": (base + timedelta(days=i)).strftime("%b %d"), "risk": 0, "success": 0, "hallucination": 0, "latency": 0} for i in range(7)]
    models = [
        {"model": item.target_model, "risk": item.risk_score, "cost": item.estimated_cost, "latency": item.latency_ms}
        for item in tests[-8:]
    ]
    return {
        "totals": {"tests": total, "critical": critical, "average_risk": average_risk, "cost": cost},
        "trends": trends,
        "models": models,
        "guardrails": [
            {"name": "Injection", "effectiveness": max(0, 100 - average_risk)},
            {"name": "Toxicity", "effectiveness": 88 if total else 0},
            {"name": "Leakage", "effectiveness": 82 if total else 0},
            {"name": "Hallucination", "effectiveness": 76 if total else 0},
        ],
    }
