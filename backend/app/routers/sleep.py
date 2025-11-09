from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from app.database import get_session
from app.models import SleepEntry
from app.routers.auth import get_current_user, User

router = APIRouter()

@router.get("/sleep")
async def get_sleep_entries(
    current_user: User = Depends(get_current_user),
    start_date: date | None = None,
    end_date: date | None = None,
    min_hours: float | None = None,
    max_hours: float | None = None,
    quality: str | None = None,
    session: Session= Depends(get_session)):
    query = select(SleepEntry)
    
    if start_date:
        query = query.where(SleepEntry.date >= start_date)
    if end_date:
        query = query.where(SleepEntry.date <= end_date) 
    if min_hours:
        query = query.where(SleepEntry.hours >= min_hours) 
    if max_hours:
        query = query.where(SleepEntry.hours <= max_hours) 
    if quality:
        query = query.where(SleepEntry.quality == quality)
    entries = session.exec(query).all()
    
    return {"items": entries}