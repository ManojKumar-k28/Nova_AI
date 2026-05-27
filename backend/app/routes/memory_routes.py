from fastapi import APIRouter, Depends, status
from app.auth.jwt_handler import get_current_user
from app.database.supabase_client import supabase
from app.services import memory_service

router = APIRouter(tags=["memory"])

@router.get("/")
async def get_memory(
    current_user: dict = Depends(get_current_user)
):
    # requires auth
    # calls memory_service.get_user_memory_context
    # returns memory context for current user
    user_id = current_user["id"]
    context = await memory_service.get_user_memory_context(user_id)
    return {"context": context}

@router.delete("/")
async def clear_memory(
    current_user: dict = Depends(get_current_user)
):
    # requires auth
    # deletes all sessions and messages for user
    user_id = current_user["id"]
    
    # Fetch user session IDs
    res = supabase.table("sessions").select("id").eq("user_id", user_id).execute()
    sessions = res.data
    
    if sessions:
        session_ids = [s["id"] for s in sessions]
        # Delete messages belonging to those sessions
        supabase.table("messages").delete().in_("session_id", session_ids).execute()
        
    # Delete sessions themselves
    supabase.table("sessions").delete().eq("user_id", user_id).execute()
    supabase.table("user_learnings").delete().eq("user_id", user_id).execute()
    
    # returns success message
    return {"message": "All conversations and memories cleared successfully."}
