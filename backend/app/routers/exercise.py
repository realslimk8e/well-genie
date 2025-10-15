from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from app.database import get_session
from app.models import ExerciseEntry

router = APIRouter()

@router.get("/exercise")
async def get_exercise_entries(session: Session= Depends(get_session)):
    query = select(ExerciseEntry)
    entries = session.exec(query).all()
    
    return {"items": entries}