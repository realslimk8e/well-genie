from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from app.database import get_session
from app.models import SleepEntry

router = APIRouter()

@router.get("/sleep")
async def get_sleep_entries(session: Session= Depends(get_session)):
    query = select(SleepEntry)
    entries = session.exec(query).all()
    
    return {"items": entries}