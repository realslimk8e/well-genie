from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from app.database import get_session
from app.models import ExerciseEntry

router = APIRouter()

@router.get("/exercise")
async def get_exercise_entries(
    start_date: date | None = None,
    end_date: date | None = None,
    min_steps: int | None = None,
    max_steps: int | None = None,
    duration_min: float | None = None,
    min_calories_burned: float | None = None,
    session: Session= Depends(get_session)):
    query = select(ExerciseEntry)
    
    if start_date:
        query = query.where(ExerciseEntry.date >= start_date)
    if end_date:
        query = query.where(ExerciseEntry.date <= end_date) 
    if min_steps:
        query = query.where(ExerciseEntry.steps >= min_steps) 
    if max_steps:
        query = query.where(ExerciseEntry.steps <= max_steps)
    if duration_min:
        query = query.where(ExerciseEntry.duration_min >= duration_min)
    if min_calories_burned:
        query = query.where(ExerciseEntry.calories_burned >= min_calories_burned)
    entries = session.exec(query).all()
    
    return {"items": entries}