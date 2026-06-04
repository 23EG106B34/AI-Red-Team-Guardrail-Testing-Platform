from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, HttpUrl


class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class SignupIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordIn(BaseModel):
    email: EmailStr


class AuthOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class AttackPromptOut(BaseModel):
    id: str
    name: str
    category: str
    severity: str
    prompt: str
    guardrail_hint: str

    model_config = {"from_attributes": True}


class TestRunIn(BaseModel):
    target_model: str = Field(min_length=2, max_length=120)
    target_url: HttpUrl
    policy: str = Field(min_length=10, max_length=2000)
    categories: list[str] = Field(default_factory=list)


class TestRunOut(BaseModel):
    id: str
    target_model: str
    status: str
    risk_score: int
    attack_success_rate: float
    hallucination_rate: float
    latency_ms: int
    estimated_cost: float
    recommendation: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ReportOut(BaseModel):
    id: str
    test_run_id: str
    title: str
    pdf_url: str
    docx_url: str
    created_at: datetime


class ApiKeyIn(BaseModel):
    provider: str = Field(min_length=2, max_length=80)
    key: str = Field(min_length=12, max_length=500)


class ApiKeyOut(BaseModel):
    id: str
    provider: str
    key_preview: str
    created_at: datetime

    model_config = {"from_attributes": True}
