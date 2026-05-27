from app.vectorstore.chroma_store import search_documents

async def retrieve_context(
    query: str, user_id: str, k: int = 4
) -> tuple[str, list]:
    # calls search_documents from chroma_store
    results = await search_documents(user_id=user_id, query=query, k=k)
    
    # joins content into single context string
    contents = [r["content"] for r in results]
    context_string = "\n\n".join(contents)
    
    # builds sources list with filename, content preview, score
    sources_list = []
    for r in results:
        preview = r["content"][:150] + "..." if len(r["content"]) > 150 else r["content"]
        sources_list.append({
            "filename": r["filename"],
            "content": preview,
            "score": r["score"]
        })
        
    # returns (context_string, sources_list)
    return context_string, sources_list

def build_rag_prompt(
    query: str, context: str, history: list
) -> str:
    # builds history text from last 6 messages
    history_text = ""
    last_six = history[-6:] if len(history) > 6 else history
    for msg in last_six:
        role = msg.get("role", "user").capitalize()
        content = msg.get("content", "")
        history_text += f"{role}: {content}\n"
        
    # returns formatted prompt string
    prompt = (
        f"Document Context:\n{context}\n\n"
        f"Conversation History:\n{history_text}\n"
        f"Question: {query}\n\n"
        f"Answer using the documents. Cite sources."
    )
    return prompt
