from __future__ import annotations

from fastapi import Request
from sqlalchemy.orm import Session
from app.models.entities import AuditLog, User


def audit(db: Session, action: str, actor: User | None = None, request: Request | None = None, **metadata):
    entry = AuditLog(
        actor_id=actor.id if actor else None,
        action=action,
        metadata_json=metadata,
        ip_address=request.client.host if request and request.client else None,
    )
    db.add(entry)
    db.commit()
