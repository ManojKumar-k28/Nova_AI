import os
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_KEY: str
    JWT_SECRET: str
    JWT_EXPIRE_HOURS: int = 72

    # ── Groq LLM ──────────────────────────────────────────────────────────────
    # Free API key: https://console.groq.com
    GROQ_API_KEY: str = ""
    GROQ_DEFAULT_MODEL: str = "llama-3.3-70b"

    # ── Embeddings (HuggingFace Inference API — free tier) ────────────────────
    # Free API key: https://huggingface.co/settings/tokens
    # Optional: if not set, a hash fallback is used (RAG still works)
    HUGGINGFACE_API_KEY: str = ""

    # ── Vector store ──────────────────────────────────────────────────────────
    VECTOR_DB_PATH: str = os.path.join(BASE_DIR, "vectorstore", "nova")
    CHROMA_HOST: str = "api.trychroma.com"
    CHROMA_API_KEY: str = ""
    CHROMA_TENANT: str = "default_tenant"
    CHROMA_DATABASE: str = "default_database"

    # ── Voice ─────────────────────────────────────────────────────────────────
    WHISPER_MODEL: str = "base"

    # ── App ───────────────────────────────────────────────────────────────────
    APP_NAME: str = "Nova AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"

    @field_validator("VECTOR_DB_PATH")
    @classmethod
    def resolve_vector_db_path(cls, value: str) -> str:
        if os.path.isabs(value):
            return value
        return os.path.join(BASE_DIR, value)

    model_config = SettingsConfigDict(
        env_file=os.path.join(BASE_DIR, ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
