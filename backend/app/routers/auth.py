from fastapi import APIRouter, Depends, Response, Cookie, HTTPException, status, Request
from sqlmodel import Session, select
from typing import Annotated, Optional
import base64
from app.database import get_session as get_db_session
from app.models import User
from app.services.auth import verify_password
from app.services.sessions import create_session, get_session as get_user_session, delete_session
from datetime import datetime


router = APIRouter()

async def get_current_user(
    session_token: Annotated[Optional[str], Cookie(alias="session")] = None,
    db: Session = Depends(get_db_session)
) -> User:
    if not session_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    session_data = get_user_session(session_token)
    if not session_data:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired session")

    user = db.get(User, session_data["user_id"])
    
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    
    return user

@router.post("/login")
async def login(
    request: Request,
    response: Response,
    db: Session = Depends(get_db_session)
):
    print("Login attempt at", datetime.utcnow())
    
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Basic '):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing authorization header"
        )
    
    try:
        credentials_bytes = base64.b64decode(auth_header[6:])  # Skip "Basic "
        credentials_str = credentials_bytes.decode('utf-8')
        username, password = credentials_str.split(':', 1)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid authorization header format"
        )
    
    statement = select(User).where(User.username == username)
    user = db.exec(statement).first()

    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    assert user.id is not None, "User ID should exist after database fetch"
    
    token = create_session(user.id)
    
    response.set_cookie(
        key="session",
        value=token,
        httponly=True,
        max_age=60 * 60 * 24,  # 24 hours
        samesite="lax"
    )
    
    return {"message": "Login successful", "username": user.username}

@router.post("/logout")
async def logout(
    response: Response,
    session_token: Annotated[Optional[str], Cookie(alias="session")] = None
):
    if session_token:
        delete_session(session_token)
    
    response.delete_cookie(key="session")
    
    return {"message": "Logout successful"}

@router.get("/me")
async def read_current_user(
    current_user: Annotated[User, Depends(get_current_user)]
):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
    }