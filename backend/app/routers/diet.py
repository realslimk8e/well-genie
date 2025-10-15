from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from app.database import get_session
from app.models import DietEntry

router = APIRouter()

@router.get("/diet")
async def get_diet_entries(session: Session= Depends(get_session)):
    query = select(DietEntry)
    entries = session.exec(query).all()
    
    return {"items": entries}