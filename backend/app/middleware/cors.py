from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings

def setup_cors(app: FastAPI):
    # Setup CORS middleware allowing specified origins, credentials, methods, and headers
    origins = [orig.strip() for orig in settings.ALLOWED_ORIGINS.split(",") if orig.strip()]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_origin_regex=r"https://.*\.vercel\.app|http://(localhost|127\.0\.0\.1):\d+",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
