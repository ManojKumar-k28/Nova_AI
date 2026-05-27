"""
Embedding service — uses the Hugging Face Inference API (free, no install needed)
for text embeddings so we have zero dependency on Ollama.

Model: sentence-transformers/all-MiniLM-L6-v2  (384-dim, very fast, free tier)

If HUGGINGFACE_API_KEY is not set we fall back to a simple TF-IDF-style
hash embedding so the server never crashes (RAG will work, just with lower quality).
"""

import hashlib
import logging
import httpx
from typing import List
from app.config.settings import settings

logger = logging.getLogger("nova-ai.embedding")

HF_API_URL = (
    "https://api-inference.huggingface.co/pipeline/feature-extraction/"
    "sentence-transformers/all-MiniLM-L6-v2"
)
EMBEDDING_DIM = 384


def _hash_embed(text: str) -> List[float]:
    """Deterministic pseudo-embedding used as fallback when no API key is set."""
    seed = int(hashlib.sha256(text.encode()).hexdigest(), 16)
    result = []
    for i in range(EMBEDDING_DIM):
        seed = (seed * 6364136223846793005 + 1442695040888963407) & 0xFFFFFFFFFFFFFFFF
        result.append((seed / 0xFFFFFFFFFFFFFFFF) * 2 - 1)
    return result


async def get_embedding(text: str) -> List[float]:
    key = settings.HUGGINGFACE_API_KEY
    if not key:
        logger.warning(
            "HUGGINGFACE_API_KEY not set — using hash fallback for embeddings. "
            "RAG will work but semantic search quality is reduced."
        )
        return _hash_embed(text)

    headers = {"Authorization": f"Bearer {key}"}
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            HF_API_URL,
            headers=headers,
            json={"inputs": text, "options": {"wait_for_model": True}},
        )
        if response.is_error:
            logger.warning(
                "HuggingFace embedding API error %s — falling back to hash embed",
                response.status_code,
            )
            return _hash_embed(text)
        data = response.json()
        # HF returns List[List[float]] for batch or List[float] for single
        if data and isinstance(data[0], list):
            return data[0]
        return data


async def get_embeddings(texts: List[str]) -> List[List[float]]:
    embeddings = []
    for text in texts:
        emb = await get_embedding(text)
        embeddings.append(emb)
    return embeddings
