from sqlmodel import Field, SQLModel, create_engine
from datetime import date

class SleepEntry(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    date: date
    hours: float
    quality: str

class ExerciseEntry(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    date: date
    steps: int
    duration_min: float
    calories_burned: float

class DietEntry(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    date: date
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
