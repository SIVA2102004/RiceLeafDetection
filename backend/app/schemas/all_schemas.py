from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from app.models.all_models import UserRole, SeverityLevel, ReviewStatus

# Auth schemas
class UserCreate(BaseModel):
    name: str
    phone: str
    password: str
    email: Optional[EmailStr] = None
    language: str = "en"
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    role: Optional[UserRole] = UserRole.FARMER

class UserLogin(BaseModel):
    identifier: str  # phone or email
    password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class UserResponse(BaseModel):
    id: int
    name: str
    phone: str
    email: Optional[str] = None
    role: UserRole
    language: str
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Field schemas
class FieldCreate(BaseModel):
    name: str
    village: Optional[str] = None
    area: float
    area_unit: str = "acres"
    variety: Optional[str] = None
    planting_date: Optional[datetime] = None
    harvest_date: Optional[datetime] = None
    notes: Optional[str] = None

class FieldResponse(FieldCreate):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Disease schemas
class DiseaseBase(BaseModel):
    name: str
    scientific_name: Optional[str] = None
    description: str
    symptoms: List[str]
    risk_factors: List[str]
    precautions: List[str]
    management: List[str]
    source: Optional[str] = None
    region: Optional[str] = "India"
    status: ReviewStatus = ReviewStatus.APPROVED

class DiseaseResponse(DiseaseBase):
    id: int
    created_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Analysis schemas
class QualityCheckResult(BaseModel):
    is_valid: bool
    is_rice_plant: bool
    message: str
    brightness_score: float
    sharpness_score: float

class AnalysisResponse(BaseModel):
    analysis_id: int
    is_rice_plant: bool
    condition: str
    confidence: float
    severity: SeverityLevel
    affected_area_percentage: float
    symptoms: List[str]
    risk_factors: List[str]
    precautions: List[str]
    management: List[str]
    model_version: str
    is_demo: bool
    expert_review_required: bool
    image_url: str
    created_at: datetime
    field_id: Optional[int] = None
    quality: Optional[QualityCheckResult] = None

# Chat schemas
class ChatMessageCreate(BaseModel):
    message: str
    language: str = "en"
    analysis_id: Optional[int] = None  # to pass diagnosis context

class ChatMessageResponse(BaseModel):
    id: int
    role: str
    message: str
    language: str
    created_at: datetime

class ChatSessionResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    messages: List[ChatMessageResponse] = []

    class Config:
        from_attributes = True

# Feedback schema
class FeedbackCreate(BaseModel):
    analysis_id: int
    rating: int  # 1: Yes/Helpful, 0: No
    comment: Optional[str] = None

# Admin / Expert Schemas
class AdminStats(BaseModel):
    total_farmers: int
    total_analyses: int
    disease_cases: int
    healthy_cases: int
    pending_reviews: int
    total_feedback: int

class ExpertReviewCreate(BaseModel):
    analysis_id: int
    verified_condition: str
    comments: Optional[str] = None
