from datetime import datetime
from app.database.supabase_client import supabase

async def get_conversation_history(
    session_id: str, limit: int = 20
) -> list:
    # queries supabase messages table
    # filters by session_id
    # orders by timestamp ascending
    # limits to limit rows
    response = supabase.table("messages") \
        .select("role", "content") \
        .eq("session_id", session_id) \
        .order("timestamp", desc=False) \
        .limit(limit) \
        .execute()
    # returns list of dicts with role and content
    return response.data

async def save_message(
    session_id: str,
    role: str,
    content: str,
    used_rag: bool = False,
    sources: list = None
) -> dict:
    # inserts into supabase messages table
    # fields: session_id, role, content, used_rag, sources(json), timestamp now
    data = {
        "session_id": session_id,
        "role": role,
        "content": content,
        "used_rag": used_rag,
        "sources": sources,
        "timestamp": datetime.utcnow().isoformat()
    }
    response = supabase.table("messages").insert(data).execute()
    # returns inserted row
    if response.data:
        return response.data[0]
    return {}

async def update_session_title(
    session_id: str, title: str
):
    # updates supabase sessions table
    # sets title and updated_at
    # where id = session_id
    data = {
        "title": title,
        "updated_at": datetime.utcnow().isoformat()
    }
    supabase.table("sessions").update(data).eq("id", session_id).execute()

async def get_user_memory_context(
    user_id: str
) -> str:
    # gets last 5 sessions from supabase
    sessions_response = supabase.table("sessions") \
        .select("id", "title") \
        .eq("user_id", user_id) \
        .order("updated_at", desc=True) \
        .limit(5) \
        .execute()
    sessions = sessions_response.data
    
    if not sessions:
        return "No previous conversational memories found."
    
    # formats as text summary
    summary_lines = []
    for sess in sessions:
        sess_id = sess["id"]
        title = sess["title"]
        # get last 2 messages for this session
        msg_response = supabase.table("messages") \
            .select("role", "content") \
            .eq("session_id", sess_id) \
            .order("timestamp", desc=True) \
            .limit(2) \
            .execute()
        messages = msg_response.data
        messages.reverse()
        
        session_summary = f"Topic: '{title}'"
        for m in messages:
            role = m["role"].capitalize()
            content = m["content"][:80] + "..." if len(m["content"]) > 80 else m["content"]
            session_summary += f"\n  - {role}: {content}"
        summary_lines.append(session_summary)
        
    # returns memory context string
    return "\n\n".join(summary_lines)


# ===========================================================================
# Autonomous Model Self-Training & Preference Extraction Engine (Self-Improving)
# ===========================================================================

import logging

logger = logging.getLogger("nova-ai.memory")

def _normalize_learning(text: str) -> str:
    return " ".join(text.lower().strip().split())

async def get_user_learnings(user_id: str) -> list[str]:
    """Fetch self-trained user preferences, corrections, and custom styling rules."""
    try:
        response = supabase.table("user_learnings") \
            .select("learning") \
            .eq("user_id", user_id) \
            .order("created_at", desc=False) \
            .execute()
        return [row["learning"] for row in response.data or [] if row.get("learning")]
    except Exception as e:
        logger.error("Failed to read user learnings: %s", e)
        return []

async def learn_user_preferences(session_id: str, user_id: str):
    """Asynchronously examine the last exchange to extract, learn, and dynamically train on user corrections/rules."""
    try:
        from app.services import ollama_service as llm_service
        
        # Get last 4 messages in the active session
        response = supabase.table("messages") \
            .select("role", "content") \
            .eq("session_id", session_id) \
            .order("timestamp", desc=True) \
            .limit(4) \
            .execute()
        messages = response.data
        if not messages or len(messages) < 2:
            return
            
        messages.reverse()
        exchange_text = ""
        for m in messages:
            exchange_text += f"{m['role'].upper()}: {m['content']}\n\n"
            
        prompt = (
            "You are Nova's Autonomous Self-Improving Memory Engine. "
            "Examine the chat exchange below and extract any new personal preferences, self-corrections, "
            "explicit rules, system instructions, or facts the user expressed about themselves or how they want you to respond.\n\n"
            "Examples of user learnings:\n"
            "- 'My name is John' -> 'User's name is John.'\n"
            "- 'Always explain code briefly' -> 'User prefers brief explanations for code blocks.'\n"
            "- 'You made a mistake, that parameter is optional' -> 'Self-Correction: When writing API X, treat parameter Y as optional.'\n\n"
            "Rules:\n"
            "1. Output ONLY a clean bulleted list starting with '-' of the newly learned facts/rules (one per line).\n"
            "2. If the user did not specify any personal facts, rules, self-corrections, or formatting instructions, output strictly 'NONE'.\n"
            "3. Do NOT repeat or list standard greetings or generic queries.\n\n"
            f"Chat Exchange:\n{exchange_text}"
        )
        
        # Get learning extraction from Groq
        learnings_raw = await llm_service.simple_response(prompt, model="llama-3.3-70b")
        learnings_raw = learnings_raw.strip()
        
        if not learnings_raw or learnings_raw == "NONE" or "none" in learnings_raw.lower():
            return
            
        # Parse extracted lines
        new_bullets = []
        for line in learnings_raw.split("\n"):
            line = line.strip().lstrip("-").strip()
            if line and len(line) > 5:
                new_bullets.append(line)
                
        if not new_bullets:
            return
            
        existing_learnings = await get_user_learnings(user_id)
        
        # Append new unique learnings (case-insensitive check)
        rows_to_upsert = []
        for new_b in new_bullets:
            if not any(new_b.lower() in exist.lower() or exist.lower() in new_b.lower() for exist in existing_learnings):
                rows_to_upsert.append({
                    "user_id": user_id,
                    "learning": new_b,
                    "normalized_learning": _normalize_learning(new_b),
                    "created_at": datetime.utcnow().isoformat()
                })
                
        if rows_to_upsert:
            supabase.table("user_learnings").upsert(
                rows_to_upsert,
                on_conflict="user_id,normalized_learning"
            ).execute()
            logger.info("Successfully updated user self-learning memory for user %s: %s", user_id, rows_to_upsert)
            
    except Exception as e:
        logger.error("Failed to execute self-learning process: %s", e)
