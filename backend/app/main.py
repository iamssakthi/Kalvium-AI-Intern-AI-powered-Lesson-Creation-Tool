from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.logger import logger
from app.core.errors import AppBaseException
from app.database.connection import init_db
from app.api.routes_lessons import router as lessons_router
from app.api.routes_research import router as research_router
from app.api.routes_qc import router as qc_router
from app.api.routes_recommendations import router as recommendations_router
from app.api.routes_export import router as export_router
from app.api.routes_stats import router as stats_router

# Initialize database tables
init_db()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Production-grade AI-powered Lesson Creation & Research Platform with multi-source retrieval, dual independent QC layers, and ReportLab PDF exports."
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Centralized Exception Handler
@app.exception_handler(AppBaseException)
async def custom_app_exception_handler(request: Request, exc: AppBaseException):
    logger.error(f"AppBaseException: {exc.message} | Details: {exc.details}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.message,
            "details": exc.details
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "An unexpected internal server error occurred.",
            "details": str(exc) if settings.DEBUG else None
        }
    )

# Include Routers
app.include_router(lessons_router)
app.include_router(research_router)
app.include_router(qc_router)
app.include_router(recommendations_router)
app.include_router(export_router)
app.include_router(stats_router)

@app.get("/api/health", tags=["Health"])
def health_check():
    """System health check endpoint."""
    ai_configured = bool(settings.OPENROUTER_API_KEY or settings.GEMINI_API_KEY)
    ai_provider = "OpenRouter" if settings.OPENROUTER_API_KEY else ("Gemini" if settings.GEMINI_API_KEY else "Benchmark")
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "ai_configured": ai_configured,
        "ai_provider": ai_provider,
        "gemini_model": settings.OPENROUTER_MODEL if settings.OPENROUTER_API_KEY else settings.GEMINI_MODEL,
        "gemini_configured": ai_configured,  # Kept for frontend backwards compatibility
        "tavily_configured": bool(settings.TAVILY_API_KEY),
        "youtube_configured": bool(settings.YOUTUBE_API_KEY)
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "documentation": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)

