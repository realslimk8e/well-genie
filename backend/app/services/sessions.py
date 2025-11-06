import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict

sessions: Dict[str, Dict] = {}

SESSION_DURATION = 60*24

def create_session(user_id: int) -> str:
    """Create a new session and return token"""
    token = secrets.token_urlsafe(32)
    sessions[token] = {
        "user_id": user_id,
        "created_at": datetime.now(),
        "expires_at": datetime.now() + timedelta(minutes=SESSION_DURATION)
    }
    return token

def get_session(token: str) -> Optional[dict]:
    """Get session if valid and not expired"""
    session = sessions.get(token)
    if not session:
        return None
    
    if datetime.now() > session["expires_at"]:
        # Session expired, remove it
        del sessions[token]
        return None
    
    return session

def delete_session(token: str):
    """Delete a session"""
    sessions.pop(token, None)