import os
import uuid
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, BackgroundTasks, status
from fastapi.responses import FileResponse
from app.models.schemas import TranscribeResponse
from app.auth.jwt_handler import get_current_user
from app.services import voice_service

router = APIRouter(tags=["voice"])

# Root temp dir resolved relative to main.py
TEMP_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "temp")
os.makedirs(TEMP_DIR, exist_ok=True)

@router.post("/transcribe", response_model=TranscribeResponse)
async def transcribe(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    # accepts audio UploadFile
    user_id = current_user["id"]
    filename = file.filename
    ext = os.path.splitext(filename.lower())[1]
    if not ext:
        ext = ".wav"  # Default extension if missing
        
    # saves to temp/ folder
    temp_filename = f"transcribe_{user_id}_{uuid.uuid4()}{ext}"
    file_path = os.path.join(TEMP_DIR, temp_filename)
    
    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)
        
    try:
        # calls voice_service.transcribe_audio
        text = await voice_service.transcribe_audio(file_path)
        # returns TranscribeResponse with text
        return TranscribeResponse(text=text)
    finally:
        # deletes temp file
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass

@router.get("/speak")
async def speak(
    text: str,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    # accepts text query parameter
    if not text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text query parameter must not be empty."
        )
        
    # saves to temp/ folder
    temp_filename = f"speak_{uuid.uuid4()}.mp3"
    file_path = os.path.join(TEMP_DIR, temp_filename)
    
    try:
        # calls voice_service.text_to_speech
        await voice_service.text_to_speech(text, file_path)
        
        # deletes file after sending using FastAPI background task
        background_tasks.add_task(os.remove, file_path)
        
        # returns FileResponse with audio/mpeg
        return FileResponse(
            file_path,
            media_type="audio/mpeg",
            filename="speak.mp3"
        )
    except Exception as e:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Speech synthesis error: {str(e)}"
        )
