from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "RiceGuard AI"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "riceguard-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    DATABASE_URL: str = "sqlite:///./riceguard.db"
    
    # AI Model Configuration
    DEMO_MODE: bool = True
    MODEL_PATH: Optional[str] = None
    MIN_CONFIDENCE_THRESHOLD: float = 0.70
    
    # Storage Configuration
    STORAGE_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE_MB: int = 10
    
    # LLM / Chatbot Configuration
    LLM_API_KEY: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
