import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.config.settings import settings
from app.middleware.cors import setup_cors
from app.routes.auth_routes import router as auth_routes
from app.routes.chat_routes import router as chat_routes
from app.routes.document_routes import router as document_routes
from app.routes.voice_routes import router as voice_routes
from app.routes.memory_routes import router as memory_routes

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nova-ai")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Nova AI started")
    yield

# Creates FastAPI instance with title, version, description
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Nova AI - A complete full-stack AI assistant platform.",
    lifespan=lifespan
)

# Calls setup_cors(app) from middleware
setup_cors(app)

# Includes all 5 routers with correct prefixes
app.include_router(auth_routes, prefix="/api/auth")
app.include_router(chat_routes, prefix="/api")
app.include_router(document_routes, prefix="/api/documents")
app.include_router(voice_routes, prefix="/api/voice")
app.include_router(memory_routes, prefix="/api/memory")

@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "llm_provider": "groq",
        "default_model": settings.GROQ_DEFAULT_MODEL,
    }

@app.get("/")
async def index():
    # Has GET / that returns welcome message and docs url
    return {
        "message": f"Welcome to the {settings.APP_NAME} Platform API",
        "documentation_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
