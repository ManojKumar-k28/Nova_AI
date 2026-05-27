from datetime import datetime
import httpx
import logging
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import StreamingResponse
from app.models.schemas import ChatRequest, TrialChatRequest, SessionCreate, SessionResponse, MessageResponse, Source
from app.auth.jwt_handler import get_current_user
from app.database.supabase_client import supabase
from app.services import memory_service, rag_service, ollama_service as llm_service
from app.utils.helpers import generate_session_title

router = APIRouter(tags=["chat"])
logger = logging.getLogger("nova-ai.chat")

import re

def check_source_code_leak(message: str) -> StreamingResponse | None:
    msg_lower = message.lower()
    patterns = [
        r"\b(source\s*code|codebase|github\s*repo|repository)\b.*\b(nova\s*ai|nova-ai|this\s*app|this\s*project|platform)\b",
        r"\b(give|show|display|reveal|print|get|read|view|export)\b.*\b(your|nova|nova-ai|nova\s*ai)\b.*\b(code|source|files|backend|frontend|main\.py|routes|components)\b",
        r"\b(nova\s*ai|nova-ai|nova)\b.*\b(source\s*code|codebase|implementation\s*details|files)\b",
        r"code\s*of\s*(nova|nova-ai|nova\s*ai)",
        r"\b(reveal|extract|print|show)\b.*\b(system\s*prompt|system\s*instruction|developer\s*prompt)\b"
    ]
    is_leak_attempt = False
    for pattern in patterns:
        if re.search(pattern, msg_lower):
            is_leak_attempt = True
            break
            
    if is_leak_attempt:
        async def restricted_stream():
            restricted_msg = (
                "### 🛡️ Access Restricted\n\n"
                "**Security Policy Rule 403-A (Codebase Protection):**\n"
                "Retrieval of the internal source code, backend logic, or frontend implementation files "
                "for the **Nova AI Platform** is strictly locked.\n\n"
                "> 🚫 **Unauthorized Request Blocked:** Internal system shields have intercepted this query "
                "to protect the intellectual property and offline security architecture of Nova Intelligence."
            )
            chunk_size = 12
            for i in range(0, len(restricted_msg), chunk_size):
                yield restricted_msg[i:i+chunk_size]
                
        return StreamingResponse(restricted_stream(), media_type="text/plain")
    return None

@router.post("/chat")
async def chat(body: ChatRequest, current_user: dict = Depends(get_current_user)):
    # 1. Source code leakage prevention
    leak_check = check_source_code_leak(body.message)
    if leak_check:
        return leak_check

    # POST /chat (requires auth, StreamingResponse)
    user_id = current_user["id"]
    
    # Verify session belongs to user
    sess_res = supabase.table("sessions").select("*").eq("id", body.session_id).eq("user_id", user_id).execute()
    if not sess_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    session = sess_res.data[0]
    
    # saves user message to supabase via memory_service
    await memory_service.save_message(
        session_id=body.session_id,
        role="user",
        content=body.message
    )
    
    # gets conversation history from memory_service
    history = await memory_service.get_conversation_history(body.session_id)
    
    # if use_rag: gets RAG context from rag_service
    rag_context = None
    sources_data = []
    if body.use_rag:
        rag_context, sources_data = await rag_service.get_rag_context(body.message, user_id)
        
    # Fetch self-trained preferences and corrections
    user_learnings = await memory_service.get_user_learnings(user_id)
    learnings_block = None
    if user_learnings:
        learnings_block = "Self-Trained User Rules, Preferences & Factual Corrections:\n" + "\n".join(f"- {l}" for l in user_learnings)

    # if use_memory: gets user memory context
    if body.use_memory:
        mem_context = await memory_service.get_user_memory_context(user_id)
        if mem_context and "No previous conversational memories" not in mem_context:
            if rag_context:
                rag_context = f"Relevant user memories from past sessions:\n{mem_context}\n\n" + rag_context
            else:
                rag_context = f"Relevant user memories from past sessions:\n{mem_context}"

    # Inject learned rules & preferences into active context block
    if learnings_block:
        if rag_context:
            rag_context = learnings_block + "\n\n" + rag_context
        else:
            rag_context = learnings_block

    # creates StreamingResponse
    async def stream_generator():
        collected_chunks = []
        try:
            # streams from llm_service.stream_response
            async for chunk in llm_service.stream_response(
                message=body.message,
                history=history,
                model=body.model,
                rag_context=rag_context
            ):
                collected_chunks.append(chunk)
                yield chunk
        except Exception as e:
            yield f"\n[Error streaming response: {str(e)}]"
            
        full_response = "".join(collected_chunks)
        if full_response:
            # after streaming: saves assistant response
            await memory_service.save_message(
                session_id=body.session_id,
                role="assistant",
                content=full_response,
                used_rag=bool(rag_context),
                sources=sources_data if rag_context else None
            )
            
            # if first message: updates session title
            if session.get("title") == "New Conversation" or not session.get("title"):
                try:
                    new_title = await llm_service.generate_chat_headline(body.message, model=body.model)
                except Exception:
                    new_title = generate_session_title(body.message)
                await memory_service.update_session_title(body.session_id, new_title)

            # Trigger background task to asynchronously learn user preferences & corrections from this exchange
            import asyncio
            asyncio.create_task(memory_service.learn_user_preferences(body.session_id, user_id))


    # returns StreamingResponse with text/plain
    return StreamingResponse(stream_generator(), media_type="text/plain")

@router.get("/sessions", response_model=list[SessionResponse])
async def get_sessions(current_user: dict = Depends(get_current_user)):
    # fetches all sessions for user from supabase
    # ordered by created_at descending
    user_id = current_user["id"]
    res = supabase.table("sessions").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    sessions = res.data
    
    output = []
    for sess in sessions:
        # for each session gets message count
        msg_res = supabase.table("messages").select("id", count="exact").eq("session_id", sess["id"]).execute()
        count = msg_res.count if msg_res.count is not None else 0
        output.append(SessionResponse(
            id=str(sess["id"]),
            user_id=str(sess["user_id"]),
            title=sess["title"],
            model=sess["model"],
            created_at=datetime.fromisoformat(sess["created_at"].replace("Z", "+00:00")),
            message_count=count
        ))
    # returns list of SessionResponse
    return output

@router.post("/sessions", response_model=SessionResponse)
async def create_session(body: SessionCreate, current_user: dict = Depends(get_current_user)):
    # receives SessionCreate body
    # inserts new session to supabase
    user_id = current_user["id"]
    now = datetime.utcnow().isoformat()
    new_sess = {
        "user_id": user_id,
        "title": body.title,
        "model": body.model,
        "created_at": now,
        "updated_at": now
    }
    res = supabase.table("sessions").insert(new_sess).execute()
    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create session"
        )
        
    sess = res.data[0]
    # returns SessionResponse
    return SessionResponse(
        id=str(sess["id"]),
        user_id=str(sess["user_id"]),
        title=sess["title"],
        model=sess["model"],
        created_at=datetime.fromisoformat(sess["created_at"].replace("Z", "+00:00")),
        message_count=0
    )

@router.get("/sessions/{session_id}/messages", response_model=list[MessageResponse])
async def get_session_messages(session_id: str, current_user: dict = Depends(get_current_user)):
    # verifies session belongs to user
    user_id = current_user["id"]
    sess_res = supabase.table("sessions").select("*").eq("id", session_id).eq("user_id", user_id).execute()
    if not sess_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
        
    # fetches all messages for session
    res = supabase.table("messages").select("*").eq("session_id", session_id).order("timestamp", desc=False).execute()
    messages = res.data
    
    output = []
    for msg in messages:
        sources_list = []
        if msg.get("sources"):
            for src in msg["sources"]:
                sources_list.append(Source(
                    filename=src.get("filename", "Unknown"),
                    content=src.get("content", ""),
                    score=float(src.get("score", 0.0))
                ))
        output.append(MessageResponse(
            id=str(msg["id"]),
            session_id=str(msg["session_id"]),
            role=msg["role"],
            content=msg["content"],
            used_rag=msg.get("used_rag", False),
            sources=sources_list if msg.get("used_rag") else None,
            timestamp=datetime.fromisoformat(msg["timestamp"].replace("Z", "+00:00"))
        ))
    # returns list of MessageResponse
    return output

@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str, current_user: dict = Depends(get_current_user)):
    # verifies session belongs to user
    user_id = current_user["id"]
    sess_res = supabase.table("sessions").select("*").eq("id", session_id).eq("user_id", user_id).execute()
    if not sess_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
        
    # deletes session (cascades to messages in supabase, but we delete manually to be safe)
    supabase.table("messages").delete().eq("session_id", session_id).execute()
    supabase.table("sessions").delete().eq("id", session_id).execute()
    
    # returns success message
    return {"message": "Session deleted successfully"}

@router.post("/trial/chat")
async def trial_chat(body: TrialChatRequest):
    # 1. Source code leakage prevention
    leak_check = check_source_code_leak(body.message)
    if leak_check:
        return leak_check
    try:
        # checks trial_usage table for session_key
        res = supabase.table("trial_usage").select("*").eq("session_key", body.session_key).execute()
    except Exception as e:
        logger.exception("Trial usage store unavailable")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Trial usage store unavailable: {str(e)}"
        ) from e

    trial_record = (res.data or [None])[0]
    trial_count = int(trial_record.get("message_count", 1)) if trial_record else 0
    if trial_count >= 3:
        # if used 3 times: raise 429 "Trial limit reached. Sign up."
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Trial limit reached. Sign up."
        )
        
    try:
        # calls llm_service.simple_response
        answer = await llm_service.simple_response(body.message, body.model)
    except httpx.HTTPStatusError as e:
        detail = e.response.text.strip()
        if not detail:
            detail = (
                f"HTTP {e.response.status_code} from "
                f"{e.request.method} {e.request.url}"
            )
        logger.exception("Groq returned an HTTP error during trial chat: %s", detail)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI service unavailable: {detail}"
        ) from e
    except httpx.HTTPError as e:
        logger.exception("Groq request failed during trial chat")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI service unavailable: {str(e)}"
        ) from e
    
    try:
        usage_payload = {
            "message_count": trial_count + 1,
            "used_at": datetime.utcnow().isoformat()
        }
        if trial_record:
            supabase.table("trial_usage").update(usage_payload).eq("session_key", body.session_key).execute()
        else:
            supabase.table("trial_usage").insert({
                "session_key": body.session_key,
                **usage_payload
            }).execute()
    except Exception as e:
        logger.exception("Failed to save trial usage")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to save trial usage: {str(e)}"
        ) from e
    
    # returns StreamingResponse with answer
    async def answer_stream():
        chunk_size = 8
        for i in range(0, len(answer), chunk_size):
            yield answer[i:i+chunk_size]
            
    return StreamingResponse(answer_stream(), media_type="text/plain")
