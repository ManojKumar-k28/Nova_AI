import os
from PyPDF2 import PdfReader
from docx import Document

async def load_document(file_path: str, filename: str) -> str:
    # detects extension: pdf, docx, txt
    ext = os.path.splitext(filename.lower())[1]
    
    if ext == ".pdf":
        # pdf: use PyPDF2 PdfReader, extract all pages text
        text = ""
        reader = PdfReader(file_path)
        for page in reader.pages:
            t = page.extract_text()
            if t:
                text += t + "\n"
        return text
        
    elif ext in [".docx", ".doc"]:
        # docx: use python-docx Document, extract paragraphs
        doc = Document(file_path)
        text = ""
        for para in doc.paragraphs:
            if para.text:
                text += para.text + "\n"
        return text
        
    elif ext == ".txt":
        # txt: read file directly with open()
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
            
    else:
        # raises ValueError for unsupported types
        raise ValueError(f"Unsupported file extension: {ext}")
