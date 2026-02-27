from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from app.database import get_session
from app.models import SleepEntry
from app.routers.auth import get_current_user, User
from app.services.delete import delete_sleep_records

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


@router.delete("/sleep")
async def delete_sleep_entries(
    start_date: date,
    end_date: date,
    session: Session = Depends(get_session),
):
    """Delete sleep entries within a date range."""
    deleted_count = delete_sleep_records(session, start_date, end_date)
    return {"message": f"Successfully deleted {deleted_count} sleep entries."}