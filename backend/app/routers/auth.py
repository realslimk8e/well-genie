from fastapi import APIRouter, Depends, Response, Cookie, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from sqlmodel import Session, select
from typing import Annotated, Optional
from app.database import get_session
from app.models import User
from app.services.auth import verify_password
from app.services.sessions import create_session, get_session, delete_session
from datetime import datetime


security = HTTPBasic()

router = APIRouter()

async def get_current_user(
    session_token: Annotated[Optional[str], Cookie(alias="session")] = None,
    db: Session = Depends(get_session)
) -> User:
    if not session_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    session_data = get_session(session_token)
    if not session_data:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired session")

    user = db.get(User, session_data["user_id"])
    
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    
    return user

@router.post("/login")
async def login(
    response: Response,
    credentials: Annotated[HTTPBasicCredentials, Depends(security)],
    db: Session = Depends(get_session)
):
    statement = select(User).where(User.username == credentials.username)
    user = db.exec(statement).first()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Basic"},
        )
    
    user.last_login = datetime.utcnow()
    db.add(user)
    db.commit()
    
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
    
    # Clear cookie
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