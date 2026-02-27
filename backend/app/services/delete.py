from datetime import date
from sqlmodel import Session, select
from app.models import DietEntry, ExerciseEntry, SleepEntry

def delete_diet_records(session: Session, start_date: date, end_date: date):
    """Delete diet records within a date range."""
    query = select(DietEntry).where(DietEntry.date >= start_date).where(DietEntry.date <= end_date)
    results = session.exec(query).all()
    for row in results:
        session.delete(row)
    session.commit()
    return len(results)

def delete_exercise_records(session: Session, start_date: date, end_date: date):
    """Delete exercise records within a date range."""
    query = select(ExerciseEntry).where(ExerciseEntry.date >= start_date).where(ExerciseEntry.date <= end_date)
    results = session.exec(query).all()
    for row in results:
        session.delete(row)
    session.commit()
    return len(results)

def delete_sleep_records(session: Session, start_date: date, end_date: date):
    """Delete sleep records within a date range."""
    query = select(SleepEntry).where(SleepEntry.date >= start_date).where(SleepEntry.date <= end_date)
    results = session.exec(query).all()
    for row in results:
        session.delete(row)
    session.commit()
    return len(results)
