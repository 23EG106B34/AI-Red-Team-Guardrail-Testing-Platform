from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.core.security import create_access_token, get_current_user, hash_password, verify_password
from app.db.session import get_db
from app.models.entities import User
from app.schemas.dto import AuthOut, ForgotPasswordIn, LoginIn, SignupIn, UserOut
from app.services.audit import audit

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=AuthOut)
def signup(payload: SignupIn, request: Request, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    user = User(name=payload.name, email=payload.email, password_hash=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    audit(db, "auth.signup", user, request)
    return AuthOut(access_token=create_access_token(user), user=user)


@router.post("/login", response_model=AuthOut)
def login(payload: LoginIn, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    audit(db, "auth.login", user, request)
    return AuthOut(access_token=create_access_token(user), user=user)


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordIn, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    audit(db, "auth.forgot_password", user, request, email=payload.email)
    return {"message": "If an account exists, a reset workflow has been recorded for secure processing."}


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user
