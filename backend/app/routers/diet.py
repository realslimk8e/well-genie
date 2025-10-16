from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from app.database import get_session
from app.models import DietEntry

router = APIRouter()

@router.get("/diet")
async def get_diet_entries(
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