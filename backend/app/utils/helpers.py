from datetime import datetime, timezone

def get_relative_time(timestamp: str) -> str:
    try:
        # parses ISO timestamp
        ts_str = timestamp.replace("Z", "+00:00")
        dt = datetime.fromisoformat(ts_str)
        
        # compares to now
        if dt.tzinfo is not None:
            now = datetime.now(timezone.utc)
            delta = now - dt
        else:
            now = datetime.utcnow()
            delta = now - dt
            
        seconds = int(delta.total_seconds())
        if seconds < 0:
            return "Just now"
        if seconds < 60:
            return "Just now"
        
        minutes = seconds // 60
        if minutes < 60:
            return f"{minutes} minutes ago" if minutes > 1 else "1 minute ago"
            
        hours = minutes // 60
        if hours < 24:
            return f"{hours} hours ago" if hours > 1 else "1 hour ago"
            
        days = hours // 24
        if days < 7:
            return f"{days} days ago" if days > 1 else "1 day ago"
            
        return dt.strftime("%b %d, %Y")
    except Exception:
        return "Recent"

def truncate_text(text: str, max_length: int = 40) -> str:
    # if text fits return as-is
    if not text:
        return ""
    if len(text) <= max_length:
        return text
    # else truncate at word boundary and add "..."
    truncated = text[:max_length]
    last_space = truncated.rfind(" ")
    if last_space > 0:
        return truncated[:last_space] + "..."
    return truncated + "..."

def generate_session_title(first_message: str) -> str:
    # calls truncate_text with 40 chars
    return truncate_text(first_message, 40)
