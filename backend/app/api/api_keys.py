from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.core.security import encryption, get_current_user
from app.db.session import get_db
from app.models.entities import ApiKey, User
from app.schemas.dto import ApiKeyIn, ApiKeyOut
from app.services.audit import audit

router = APIRouter(prefix="/api-keys", tags=["api-keys"])


@router.get("", response_model=list[ApiKeyOut])
def list_keys(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(ApiKey).filter(ApiKey.owner_id == user.id).order_by(ApiKey.created_at.desc()).all()


@router.post("", response_model=ApiKeyOut)
def save_key(payload: ApiKeyIn, request: Request, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    encrypted = encryption().encrypt(payload.key.encode()).decode()
    preview = f"{payload.key[:4]}...{payload.key[-4:]}"
    record = ApiKey(owner_id=user.id, provider=payload.provider.lower(), encrypted_key=encrypted, key_preview=preview)
    db.add(record)
    db.commit()
    db.refresh(record)
    audit(db, "api_key.create", user, request, provider=record.provider)
    return record
