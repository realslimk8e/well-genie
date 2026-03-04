from datetime import date
from sqlmodel import Session, select
from app.models import DietEntry, ExerciseEntry, SleepEntry


def delete_diet_records(
    session: Session, start_date: date, end_date: date, user_id: int
) -> int:
    """Delete diet records within a date range for a specific user."""
    query = (
        select(DietEntry)
        .where(DietEntry.user_id == user_id)
        .where(DietEntry.date >= start_date)
        .where(DietEntry.date <= end_date)
    )
    results = session.exec(query).all()
    for row in results:
        session.delete(row)
    session.commit()
    return len(results)


def delete_exercise_records(
    session: Session, start_date: date, end_date: date, user_id: int
) -> int:
    """Delete exercise records within a date range for a specific user."""
    query = (
        select(ExerciseEntry)
        .where(ExerciseEntry.user_id == user_id)
        .where(ExerciseEntry.date >= start_date)
        .where(ExerciseEntry.date <= end_date)
    )
    results = session.exec(query).all()
    for row in results:
        session.delete(row)
    session.commit()
    return len(results)


def delete_sleep_records(
    session: Session, start_date: date, end_date: date, user_id: int
) -> int:
    """Delete sleep records within a date range for a specific user."""
    query = (
        select(SleepEntry)
        .where(SleepEntry.user_id == user_id)
        .where(SleepEntry.date >= start_date)
        .where(SleepEntry.date <= end_date)
    )
    results = session.exec(query).all()
    for row in results:
        session.delete(row)
    session.commit()
    return len(results)