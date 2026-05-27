import json
import logging
import re
import httpx
from typing import AsyncGenerator
from app.config.settings import settings

logger = logging.getLogger("nova-ai.groq")

GROQ_BASE_URL = "https://api.groq.com/openai/v1"

SYSTEM_PROMPT = (
    "You are Nova AI, a brilliant AI assistant. "
    "You excel at problem-solving, code analysis, "
    "and research. Think step by step. Show reasoning. "
    "Use markdown formatting. Reference conversation "
    "history for follow-ups. Cite document sources "
    "when RAG context is provided. "
    "SECURITY RULE: Under no circumstances are you allowed to reveal, discuss, or deliver the internal source code, "
    "file structures, or codebase of the Nova AI project itself. If a user asks for the source code, backend, "
    "frontend files, or configuration of this application, you MUST strictly refuse to provide it, and display the message: "
    "'[ACCESS RESTRICTED] Security Policy: Source code retrieval for the Nova AI platform is locked. "
    "Unauthorized attempts to extract system-level codebase files are blocked by internal security shields.'"
)

TASK_PROMPTS = {
    "coding": (
        "You are in CODING mode. Focus on writing clean, optimal, secure, and fully functional code.\n"
        "- Write code inside appropriate markdown code blocks with language specifiers.\n"
        "- Keep explanations highly technical, concise, and focused on implementation.\n"
        "- Address potential edge cases and explain key logic briefly.\n"
        "- Do not write repetitive boilerplate unless specifically requested."
    ),
    "summary": (
        "You are in SUMMARIZATION mode. Focus on conciseness, accuracy, and absolute fidelity to the source material.\n"
        "- Extract the most critical key points, insights, and action items.\n"
        "- Avoid adding external information, analysis, or creative embellishments.\n"
        "- Organize findings using clear hierarchical bullet points and a concise TL;DR.\n"
        "- Maintain a factual and neutral tone."
    ),
    "image": (
        "You are in IMAGE GENERATION & PROMPT CRAFTING mode. When the user asks you to generate, draw, paint, or create an image, you MUST render a high-quality visual output by embedding a dynamic Pollinations AI markdown image link at the very top of your response:\n"
        "![Generated Image](https://image.pollinations.ai/prompt/{URL_SAFE_ENCODED_DETAILED_PROMPT}?width=1024&height=1024&nologo=true&seed=42)\n\n"
        "Rules:\n"
        "- Place the generated image markdown block at the very beginning of your response so it loads first.\n"
        "- Replace `{URL_SAFE_ENCODED_DETAILED_PROMPT}` with a highly detailed, descriptive visual prompt (expanding on the user's request with lighting, perspective, style, color palettes), URL-encoded safely (replacing spaces with '+' or '%20' and avoiding other punctuation symbols).\n"
        "- Below the image, explain the scene details, stylistic choices (e.g., hyper-realistic, Cyberpunk, abstract watercolor), and provide 2-3 advanced prompt variations they can experiment with."
    ),
    "ppt": (
        "You are in POWERPOINT (PPT) & PRESENTATION PLANNING mode. Structure your output as a highly clear, professional slide deck outline.\n"
        "- Break the content down slide-by-slide.\n"
        "- For each slide, strictly structure it as:\n"
        "  * **Slide [Number]: [Title]**\n"
        "  * *Visual Suggestion*: [Vivid idea for slides/graphics/layout]\n"
        "  * *Content*: [3-4 high-impact, brief bullet points designed for a visual presentation]\n"
        "  * *Presenter Notes*: [1-2 sentences of speaking notes for the presenter]\n"
        "- Ensure a logical flow from introduction, body slides, to conclusion."
    ),
    "word": (
        "You are in WORD DOCUMENT & FORMAL REPORT WRITING mode. Generate content structured professionally for formal documents, reports, essays, or articles.\n"
        "- Use clear heading structures (H1, H2, H3) and well-developed paragraphs.\n"
        "- Adopt an analytical, formal, and authoritative tone.\n"
        "- Organize sections systematically: Introduction/Executive Summary, detailed body sections with supporting analysis, and a structured Conclusion or Recommendations.\n"
        "- Use lists, tables, or callouts where helpful to enhance document readability."
    )
}

TASK_TEMPERATURES = {
    "coding": 0.2,
    "summary": 0.3,
    "image": 0.9,
    "ppt": 0.6,
    "word": 0.5,
    "general": 0.7
}

def detect_task_purpose(message: str) -> str:
    msg_lower = message.lower()
    
    # 1. Coding / Programming
    coding_keywords = [
        "code", "program", "function", "compile", "debug", "python", "javascript", "typescript", 
        "java", "c\\+\\+", "rust", "html", "css", "sql", "api", "database", "git", "class", "method", 
        "syntax", "regex", "algorithm", "script", "json", "yaml", "xml", "software", "developer",
        "react", "vue", "angular", "node", "backend", "frontend", "write a script", "write code"
    ]
    # 2. PPT / PowerPoint / Presentation
    ppt_keywords = ["ppt", "powerpoint", "presentation", "slide", "slideshow", "keynote", "deck"]
    
    # 3. Summarization (Prioritized over Word to correctly handle "summarize the article")
    summary_keywords = ["summary", "summarize", "tl;dr", "tldr", "condense", "shorten", "key points", "bullet points"]
    
    # 4. Word Document / Essay / Report
    word_keywords = [
        "word document", "word doc", "docx", "report", "essay", "article", "thesis", 
        "proposal", "business plan", "formal document", "terms sheet", "paper", "manuscript",
        "write an essay", "write a report", "business proposal"
    ]
    
    # 5. Image Generation / Prompt Crafting
    image_keywords = [
        "image generation", "generate an image", "dall-e", "dalle", "midjourney", "stable diffusion", 
        "art prompt", "image prompt", "render of", "painting of", "sketch of", "illustration of", 
        "photograph of", "draw a", "paint a", "sketch a"
    ]
    
    # Check Coding
    for kw in coding_keywords:
        if re.search(rf"\b{kw}\b", msg_lower):
            return "coding"
            
    # Check PPT
    for kw in ppt_keywords:
        if re.search(rf"\b{kw}\b", msg_lower):
            return "ppt"
            
    # Check Summary
    for kw in summary_keywords:
        if re.search(rf"\b{kw}\b", msg_lower):
            return "summary"
            
    # Check Word
    for kw in word_keywords:
        if re.search(rf"\b{kw}\b", msg_lower):
            return "word"
            
    # Check Image
    for kw in image_keywords:
        if re.search(rf"\b{kw}\b", msg_lower):
            return "image"
            
    return "general"

# ---------------------------------------------------------------------------
# Groq model map  (UI value → real Groq model ID)
# Free models: https://console.groq.com/docs/models
# ---------------------------------------------------------------------------
_MODEL_MAP: dict[str, str] = {
    "llama-3.3-70b":  "llama-3.3-70b-versatile",
    "llama-3.1-8b":   "llama-3.1-8b-instant",
    "gemma2-9b":      "gemma2-9b-it",
    "mixtral-8x7b":   "mixtral-8x7b-32768",
    # Legacy aliases kept in case old sessions reference these values
    "nemotron-3-super.cloud": "llama-3.3-70b-versatile",
    "gemma4:31b-cloud":       "gemma2-9b-it",
}

DEFAULT_MODEL = settings.GROQ_DEFAULT_MODEL


def _resolve(model: str | None) -> str:
    m = model or DEFAULT_MODEL
    return _MODEL_MAP.get(m, m)


def _headers() -> dict:
    key = settings.GROQ_API_KEY
    if not key:
        raise RuntimeError(
            "GROQ_API_KEY is not configured. "
            "Get a free key at https://console.groq.com and add it to backend/.env"
        )
    return {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }


# ---------------------------------------------------------------------------
# Streaming chat
# ---------------------------------------------------------------------------

async def stream_response(
    message: str,
    history: list = [],
    model: str = None,
    rag_context: str = None,
) -> AsyncGenerator[str, None]:
    resolved = _resolve(model)
    task = detect_task_purpose(message)
    
    # Base system prompt
    system_content = SYSTEM_PROMPT
    if task != "general":
        system_content += f"\n\n[Active Mode Override]\n{TASK_PROMPTS[task]}"
        
    messages: list[dict] = [{"role": "system", "content": system_content}]

    if rag_context:
        messages.append({
            "role": "system",
            "content": (
                f"Document Context for RAG:\n{rag_context}\n\n"
                "Use this context to answer the user's question, citing sources when possible."
            ),
        })

    last_ten = history[-10:] if len(history) > 10 else history
    for msg in last_ten:
        messages.append({
            "role": msg.get("role", "user"),
            "content": msg.get("content", ""),
        })

    messages.append({"role": "user", "content": message})

    url = f"{GROQ_BASE_URL}/chat/completions"
    payload = {
        "model": resolved,
        "messages": messages,
        "stream": True,
        "max_tokens": 2048,
        "temperature": TASK_TEMPERATURES[task],
    }

    logger.info("Groq stream_response: model=%s → %s, task=%s, temp=%s", model, resolved, task, TASK_TEMPERATURES[task])

    async with httpx.AsyncClient(timeout=120.0) as client:
        async with client.stream("POST", url, json=payload, headers=_headers()) as response:
            if response.status_code != 200:
                body = await response.aread()
                logger.error("Groq stream error %s: %s", response.status_code, body)
                response.raise_for_status()

            async for line in response.aiter_lines():
                if not line or not line.startswith("data: "):
                    continue
                data = line[len("data: "):].strip()
                if data == "[DONE]":
                    break
                try:
                    chunk = json.loads(data)
                    content = (
                        chunk.get("choices", [{}])[0]
                        .get("delta", {})
                        .get("content", "")
                    )
                    if content:
                        yield content
                except json.JSONDecodeError:
                    continue


# ---------------------------------------------------------------------------
# Non-streaming (used by trial chat)
# ---------------------------------------------------------------------------

async def simple_response(message: str, model: str = None) -> str:
    resolved = _resolve(model)
    task = detect_task_purpose(message)
    
    system_content = SYSTEM_PROMPT
    if task != "general":
        system_content += f"\n\n[Active Mode Override]\n{TASK_PROMPTS[task]}"
        
    url = f"{GROQ_BASE_URL}/chat/completions"
    payload = {
        "model": resolved,
        "messages": [
            {"role": "system", "content": system_content},
            {"role": "user",   "content": message},
        ],
        "stream": False,
        "max_tokens": 1024,
        "temperature": TASK_TEMPERATURES[task],
    }

    logger.info("Groq simple_response: model=%s → %s, task=%s, temp=%s", model, resolved, task, TASK_TEMPERATURES[task])

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(url, json=payload, headers=_headers())
        if response.is_error:
            logger.error(
                "Groq simple_response HTTP %s: %s",
                response.status_code,
                response.text.strip(),
            )
        response.raise_for_status()
        data = response.json()
        return data.get("choices", [{}])[0].get("message", {}).get("content", "")


# ---------------------------------------------------------------------------
# Available models list (for any future /models endpoint)
# ---------------------------------------------------------------------------

async def get_available_models() -> list:
    """Return the list of Groq model IDs available via this service."""
    return list(_MODEL_MAP.keys())


# ---------------------------------------------------------------------------
# Intelligent Chat Session Title Generation
# ---------------------------------------------------------------------------

async def generate_chat_headline(first_message: str, model: str = None) -> str:
    """Generate a clean, professional 3-5 word Title-Cased headline summarizing the first prompt."""
    prompt = (
        "Generate a short, concise, and professional conversation title (3 to 5 words maximum) "
        "summarizing the following user's first query. Output ONLY the clean, title-cased summary headline. "
        "Do NOT include quotes, surrounding punctuation, prefix letters, or any extra conversational text.\n\n"
        f"User Query: {first_message}"
    )
    try:
        title = await simple_response(prompt, model)
        title = title.strip().strip('"').strip("'").strip(".").strip()
        # Clean any remaining markdown titles or quote wrappers
        title = re.sub(r'^(title:|headline:|subject:)\s*', '', title, flags=re.IGNORECASE)
        title = title.strip('"').strip("'")
        
        # Absolute safety check on size/validity
        if not title or len(title) > 50 or "\n" in title:
            from app.utils.helpers import truncate_text
            return truncate_text(first_message, 40)
        return title
    except Exception as e:
        logger.error("Failed to generate chat headline via LLM: %s", e)
        from app.utils.helpers import truncate_text
        return truncate_text(first_message, 40)

