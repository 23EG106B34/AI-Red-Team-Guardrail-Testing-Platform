from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.security import get_current_user
from app.db.session import get_db
from app.models.entities import AttackPrompt, User
from app.schemas.dto import AttackPromptOut

router = APIRouter(prefix="/attacks", tags=["attacks"])


@router.get("/library", response_model=list[AttackPromptOut])
def library(_: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(AttackPrompt).order_by(AttackPrompt.category, AttackPrompt.name).all()
