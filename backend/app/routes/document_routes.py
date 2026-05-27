import os
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, status
from app.models.schemas import DocumentResponse
from app.auth.jwt_handler import get_current_user
from app.database.supabase_client import supabase
from app.services import rag_service
from app.vectorstore import chroma_store

router = APIRouter(tags=["documents"])

# Root uploads dir resolved relative to main.py
UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    filename = file.filename
    ext = os.path.splitext(filename.lower())[1]
    
    # validates: pdf, docx, txt only
    if ext not in [".pdf", ".docx", ".txt"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Only PDF, DOCX, and TXT are allowed."
        )
        
    # validates: max 20MB
    contents = await file.read()
    if len(contents) > 20 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the 20MB limit."
        )
        
    # saves file to uploads/ folder
    file_path = os.path.join(UPLOADS_DIR, f"{user_id}_{filename}")
    with open(file_path, "wb") as f:
        f.write(contents)
        
    try:
        # calls rag_service.ingest_document
        chunk_count = await rag_service.ingest_document(file_path, filename, user_id)
        
        # saves document record to supabase
        doc_data = {
            "user_id": user_id,
            "filename": filename,
            "file_path": file_path,
            "chunk_count": chunk_count,
            "uploaded_at": datetime.utcnow().isoformat()
        }
        res = supabase.table("documents").insert(doc_data).execute()
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to register document in database."
            )
            
        doc_row = res.data[0]
        # returns DocumentResponse
        return DocumentResponse(
            id=str(doc_row["id"]),
            user_id=str(doc_row["user_id"]),
            filename=doc_row["filename"],
            chunk_count=doc_row["chunk_count"],
            uploaded_at=datetime.fromisoformat(doc_row["uploaded_at"].replace("Z", "+00:00"))
        )
    finally:
        # deletes temp file after processing
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass

@router.get("/", response_model=list[DocumentResponse])
async def get_all_documents(
    current_user: dict = Depends(get_current_user)
):
    # fetches all documents for user from supabase
    # returns list of DocumentResponse
    user_id = current_user["id"]
    res = supabase.table("documents").select("*").eq("user_id", user_id).order("uploaded_at", desc=True).execute()
    docs = res.data
    
    output = []
    for doc in docs:
        output.append(DocumentResponse(
            id=str(doc["id"]),
            user_id=str(doc["user_id"]),
            filename=doc["filename"],
            chunk_count=doc["chunk_count"],
            uploaded_at=datetime.fromisoformat(doc["uploaded_at"].replace("Z", "+00:00"))
        ))
    return output

@router.get("/vectorstore/status")
async def get_vectorstore_status(
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    try:
        return await chroma_store.get_user_vectorstore_status(user_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to read ChromaDB vectorstore: {str(e)}"
        ) from e

@router.delete("/{doc_id}")
async def delete_document(
    doc_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    
    # verifies document belongs to user
    res = supabase.table("documents").select("*").eq("id", doc_id).eq("user_id", user_id).execute()
    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found."
        )
        
    doc = res.data[0]
    filename = doc["filename"]
    
    # calls chroma_store.delete_user_documents
    await chroma_store.delete_user_documents(user_id, filename)
    
    # deletes from supabase documents table
    supabase.table("documents").delete().eq("id", doc_id).execute()
    
    # returns success message
    return {"message": "Document deleted successfully"}
