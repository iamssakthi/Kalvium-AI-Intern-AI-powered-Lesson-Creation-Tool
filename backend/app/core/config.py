import os
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import Optional

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "AI-Powered Lesson Creation & Research Platform"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    
    # Storage Paths
    BASE_DIR: Path = BASE_DIR
    EXPORT_DIR_LESSONS: Path = BASE_DIR / "generated_lessons"
    EXPORT_DIR_REPORTS: Path = BASE_DIR / "generated_reports"
    
    # Database
    DATABASE_URL: str = f"sqlite:///{BASE_DIR / 'ai_lessons.db'}"
    
    # AI Engine — OpenRouter (OpenAI-compatible endpoint)
    OPENROUTER_API_KEY: Optional[str] = None
    OPENROUTER_MODEL: str = "google/gemma-4-31b-it:free"
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"

    # Legacy / fallback alias (kept so other modules that reference GEMINI_* still resolve)
    GEMINI_API_KEY: Optional[str] = None          # not used when OpenRouter is configured
    GEMINI_MODEL: str = "google/gemini-2.0-flash-exp:free"
    
    # Research Integrations
    TAVILY_API_KEY: Optional[str] = None
    YOUTUBE_API_KEY: Optional[str] = None
    GOOGLE_BOOKS_API_KEY: Optional[str] = None
    
    # 45-Minute Lesson Constraint
    MAX_LESSON_DURATION_MINUTES: int = 45
    
    class Config:
        env_file = str(BASE_DIR / ".env")
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()

# Ensure directories exist
settings.EXPORT_DIR_LESSONS.mkdir(parents=True, exist_ok=True)
settings.EXPORT_DIR_REPORTS.mkdir(parents=True, exist_ok=True)

