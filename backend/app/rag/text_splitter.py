def split_text(
    text: str,
    chunk_size: int = 500,
    chunk_overlap: int = 50
) -> list:
    if not text:
        return []
    
    # splits text into chunks of chunk_size chars
    # each chunk overlaps previous by chunk_overlap
    chunks = []
    step = chunk_size - chunk_overlap
    if step <= 0:
        step = chunk_size  # Fallback if overlap is equal/greater than size
        
    i = 0
    while i < len(text):
        chunk = text[i:i + chunk_size].strip()
        # removes empty chunks
        if chunk:
            chunks.append(chunk)
        i += step
        
    # returns list of string chunks
    return chunks
