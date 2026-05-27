from app.rag.document_loader import load_document
from app.rag.text_splitter import split_text
from app.vectorstore.chroma_store import add_documents
from app.rag.retriever import retrieve_context

async def ingest_document(
    file_path: str, filename: str, user_id: str
) -> int:
    # calls load_document to extract text
    text = await load_document(file_path, filename)
    # calls split_text to create chunks
    chunks = split_text(text)
    # calls add_documents to store in ChromaDB
    chunk_count = await add_documents(user_id, chunks, filename)
    # returns chunk count
    return chunk_count

async def get_rag_context(
    query: str, user_id: str
) -> tuple[str, list]:
    # calls retrieve_context from retriever
    # returns context string and sources list
    return await retrieve_context(query, user_id)
