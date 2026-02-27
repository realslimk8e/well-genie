from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from app.database import get_session
from app.models import DietEntry
from app.routers.auth import get_current_user, User
from app.services.delete import delete_diet_records

router = APIRouter()

@router.get("/diet")
async def get_diet_entries(
    current_user: User = Depends(get_current_user),
    start_date: date | None = None,
    end_date: date | None = None,
    min_calories: float | None = None,
    max_calories:  float | None = None,
    session: Session= Depends(get_session)):
    query = select(DietEntry)
    
    if start_date:
        query = query.where(DietEntry.date >= start_date)
    if end_date:
        query = query.where(DietEntry.date <= end_date) 
    if min_calories:
        query = query.where(DietEntry.calories >= min_calories)
    if max_calories:
        query = query.where(DietEntry.calories <= max_calories)

    entries = session.exec(query).all()
    
    return {"items": entries}


@router.delete("/diet")
async def delete_diet_entries(
    start_date: date,
    end_date: date,
    session: Session = Depends(get_session),
):
    """Delete diet entries within a date range."""
    deleted_count = delete_diet_records(session, start_date, end_date)
    return {"message": f"Successfully deleted {deleted_count} diet entries."}