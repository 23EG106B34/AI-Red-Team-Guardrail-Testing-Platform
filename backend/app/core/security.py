from datetime import datetime, timedelta, timezone
from cryptography.fernet import Fernet
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.core.config import get_settings
from app.db.session import get_db
from app.models.entities import Role, User

settings = get_settings()
password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer = HTTPBearer()


def hash_password(password: str) -> str:
    return password_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return password_context.verify(password, password_hash)


def create_access_token(user: User) -> str:
    expires = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expires_minutes)
    payload = {"sub": user.id, "email": user.email, "role": user.role.value, "exp": expires}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer), db: Session = Depends(get_db)
) -> User:
    try:
      payload = jwt.decode(credentials.credentials, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
      user_id = payload.get("sub")
    except JWTError as exc:
      raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc
    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Inactive or missing user")
    return user


def require_roles(*roles: Role):
    def dependency(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role")
        return user
    return dependency


def encryption() -> Fernet:
    if not settings.fernet_key:
        return Fernet(Fernet.generate_key())

    try:
        return Fernet(settings.fernet_key.encode())
    except (TypeError, ValueError) as exc:
        raise ValueError(
            "Invalid FERNET_KEY configured. It must be a 32-byte URL-safe base64-encoded key. "
            "Update backend/.env or the environment variable with a valid Fernet key."
        ) from exc


def looks_like_prompt_injection(text: str) -> bool:
    risky = ["ignore previous", "developer message", "system prompt", "reveal your instructions", "exfiltrate", "jailbreak"]
    lowered = text.lower()
    return any(marker in lowered for marker in risky)
