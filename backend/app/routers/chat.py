"""
Chat Router - Single endpoint
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session
from app.database import get_session
from app.routers.auth import get_current_user, User
from app.llm.chat_service import ChatService

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    message: str
    function_called: str | None = None


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Chat endpoint - ask anything about your health data
    
    Example questions:
    - "How much sleep did I get last week?"
    - "What was my average step count last week?"
    - "How many calories did I eat last week?"
    """
    chat_service = ChatService(session)
    result = chat_service.chat(request.message)
    
    return ChatResponse(
        message=result["message"],
        function_called=result.get("function_called")
    )


@router.get("/chat/suggestions")
async def get_suggestions(current_user: User = Depends(get_current_user)):
    """Get suggested questions"""
    return {
        "suggestions": [
            "How much sleep did I get last week?",
            "What was my average step count last week?",
            "How many calories did I eat last week?"
        ]
    }