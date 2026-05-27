from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class OTPSendRequest(BaseModel):
    email: EmailStr

class OTPLoginRequest(BaseModel):
    email: EmailStr
    otp: str

class GoogleLoginRequest(BaseModel):
    credential: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr

class AuthResponse(BaseModel):
    token: str
    user: UserResponse

class ChatRequest(BaseModel):
    session_id: str
    message: str
    model: Optional[str] = "qwen2.5"
    use_rag: Optional[bool] = True
    use_memory: Optional[bool] = True

class TrialChatRequest(BaseModel):
    message: str
    session_key: str
    model: Optional[str] = None

class Source(BaseModel):
    filename: str
    content: str
    score: float

class MessageResponse(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    used_rag: Optional[bool] = False
    sources: Optional[List[Source]] = None
    timestamp: datetime

class SessionCreate(BaseModel):
    title: Optional[str] = "New Conversation"
    model: Optional[str] = "qwen2.5"

class SessionResponse(BaseModel):
    id: str
    user_id: str
    title: str
    model: str
    created_at: datetime
    message_count: Optional[int] = 0

class DocumentResponse(BaseModel):
    id: str
    user_id: str
    filename: str
    chunk_count: int
    uploaded_at: datetime

class TranscribeResponse(BaseModel):
    text: str
