import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from app.db.session import Base

class UserRole(str, enum.Enum):
    FARMER = "farmer"
    EXPERT = "expert"
    ADMIN = "admin"

class SeverityLevel(str, enum.Enum):
    LOW = "Low"
    MODERATE = "Moderate"
    HIGH = "High"
    UNKNOWN = "Unknown"

class ReviewStatus(str, enum.Enum):
    DRAFT = "draft"
    NEEDS_REVIEW = "needs_review"
    APPROVED = "approved"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.FARMER, nullable=False)
    language = Column(String(10), default="en", nullable=False)
    village = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), default="India", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    fields = relationship("Field", back_populates="owner", cascade="all, delete-orphan")
    analyses = relationship("Analysis", back_populates="user", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="user", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")

class Field(Base):
    __tablename__ = "fields"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    village = Column(String(100), nullable=True)
    area = Column(Float, nullable=False)
    area_unit = Column(String(20), default="acres", nullable=False)
    variety = Column(String(100), nullable=True)
    planting_date = Column(DateTime, nullable=True)
    harvest_date = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="fields")
    analyses = relationship("Analysis", back_populates="field")

class Disease(Base):
    __tablename__ = "diseases"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    scientific_name = Column(String(100), nullable=True)
    description = Column(Text, nullable=False)
    symptoms = Column(Text, nullable=False)  # JSON-encoded or newline-separated list
    risk_factors = Column(Text, nullable=False)
    precautions = Column(Text, nullable=False)
    management = Column(Text, nullable=False)
    source = Column(String(255), nullable=True)
    region = Column(String(100), default="India", nullable=True)
    status = Column(Enum(ReviewStatus), default=ReviewStatus.APPROVED, nullable=False)
    created_by = Column(String(100), default="ICAR / IRRI Reference", nullable=True)
    reviewed_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    field_id = Column(Integer, ForeignKey("fields.id"), nullable=True, index=True)
    image_url = Column(String(255), nullable=False)
    condition = Column(String(100), nullable=False, index=True)
    confidence = Column(Float, nullable=False)
    severity = Column(Enum(SeverityLevel), default=SeverityLevel.LOW, nullable=False, index=True)
    affected_area_percentage = Column(Float, default=0.0, nullable=False)
    model_version = Column(String(50), default="rice-disease-v1", nullable=False)
    is_demo = Column(Boolean, default=True, nullable=False)
    expert_review_required = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="analyses")
    field = relationship("Field", back_populates="analyses")
    feedbacks = relationship("Feedback", back_populates="analysis", cascade="all, delete-orphan")
    expert_reviews = relationship("ExpertReview", back_populates="analysis", cascade="all, delete-orphan")

class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1 for Yes / helpful, 0 for No / unhelpful
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    analysis = relationship("Analysis", back_populates="feedbacks")
    user = relationship("User", back_populates="feedbacks")

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    title = Column(String(200), default="Crop Consultation", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # "user" or "assistant"
    message = Column(Text, nullable=False)
    language = Column(String(10), default="en", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("ChatSession", back_populates="messages")

class AIModelMeta(Base):
    __tablename__ = "ai_models"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    version = Column(String(50), unique=True, nullable=False)
    accuracy = Column(Float, nullable=True)
    val_accuracy = Column(Float, nullable=True)
    f1_score = Column(Float, nullable=True)
    precision = Column(Float, nullable=True)
    recall = Column(Float, nullable=True)
    status = Column(String(20), default="active", nullable=False)
    is_active = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class ExpertReview(Base):
    __tablename__ = "expert_reviews"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id"), nullable=False, index=True)
    expert_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    verified_condition = Column(String(100), nullable=False)
    comments = Column(Text, nullable=True)
    status = Column(String(20), default="completed", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    analysis = relationship("Analysis", back_populates="expert_reviews")
