import pytest
from datetime import date
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
from app.main import app
from app.database import get_session
from app.models import SleepEntry, ExerciseEntry, DietEntry


@pytest.fixture(name="session")
def session_fixture():
    """Create a fresh test database for each test"""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    """Create a test client with the test database session"""
    def get_session_override():
        return session
    
    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(name="sleep_entries")
def sleep_entries_fixture(session: Session):
    """
    Create comprehensive sleep entries for all filter tests.
    """
    entries = [
        SleepEntry(date=date(2024, 1, 1), hours=5.5, quality="poor"),
        SleepEntry(date=date(2024, 1, 2), hours=7.0, quality="good"),
        SleepEntry(date=date(2024, 1, 3), hours=8.0, quality="good"),
        SleepEntry(date=date(2024, 1, 4), hours=8.5, quality="excellent"),
        SleepEntry(date=date(2024, 1, 5), hours=9.0, quality="excellent"),
        SleepEntry(date=date(2024, 1, 6), hours=7.5, quality="fair"),
        SleepEntry(date=date(2024, 1, 7), hours=10.0, quality="excellent"),
    ]
    for entry in entries:
        session.add(entry)
    session.commit()
    for entry in entries:
        session.refresh(entry)
    return entries

@pytest.fixture(name="exercise_entries")
def exercise_entries_fixture(session: Session):
    """
    Create comprehensive exercise entries for all filter tests.
    """
    entries = [
        ExerciseEntry(date=date(2024, 1, 1), steps=5000, duration_min=45, calories_burned = 400),
        ExerciseEntry(date=date(2024, 1, 2), steps=6000, duration_min=6, calories_burned = 200),
        ExerciseEntry(date=date(2024, 1, 3), steps=7000, duration_min=15, calories_burned = 500),
        ExerciseEntry(date=date(2024, 1, 4), steps=8000, duration_min=30, calories_burned = 600),
        ExerciseEntry(date=date(2024, 1, 5), steps=9000, duration_min=45, calories_burned = 750),
        ExerciseEntry(date=date(2024, 1, 6), steps=10000, duration_min=60, calories_burned = 800),
        ExerciseEntry(date=date(2024, 1, 7), steps=11000, duration_min=75, calories_burned = 900),
    ]
    for entry in entries:
        session.add(entry)
    session.commit()
    for entry in entries:
        session.refresh(entry)
    return entries

@pytest.fixture(name="sleep_entries")
def sleep_entries_fixture(session: Session):
    """
    Create comprehensive exercise entries for all filter tests.
    """
    entries = [
        SleepEntry(date=date(2024, 1, 1), hours=10, quality="poor"),
        SleepEntry(date=date(2024, 1, 2), hours=5, quality= "good"),
        SleepEntry(date=date(2024, 1, 3), hours=6, quality = "fair"),
        SleepEntry(date=date(2024, 1, 4), hours=8, quality = "excellent"),
        SleepEntry(date=date(2024, 1, 5), hours=9, quality = "good"),
        SleepEntry(date=date(2024, 1, 6), hours=8, quality = "poor"),
        SleepEntry(date=date(2024, 1, 7), hours=10, quality = "fair"),
    ]
    for entry in entries:
        session.add(entry)
    session.commit()
    for entry in entries:
        session.refresh(entry)
    return entries

import pytest
from datetime import date
from io import BytesIO
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
from app.main import app
from app.database import get_session
from app.models import SleepEntry, ExerciseEntry, DietEntry


@pytest.fixture(name="session")
def session_fixture():
    """Create a fresh test database for each test"""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    """Create a test client with the test database session"""
    def get_session_override():
        return session
    
    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(name="sleep_entries")
def sleep_entries_fixture(session: Session):
    """
    Create comprehensive sleep entries for all filter tests.
    Covers various dates, hours, and quality values.
    """
    entries = [
        SleepEntry(date=date(2024, 1, 1), hours=5.5, quality="poor"),
        SleepEntry(date=date(2024, 1, 2), hours=7.0, quality="good"),
        SleepEntry(date=date(2024, 1, 3), hours=8.0, quality="good"),
        SleepEntry(date=date(2024, 1, 4), hours=8.5, quality="excellent"),
        SleepEntry(date=date(2024, 1, 5), hours=9.0, quality="excellent"),
        SleepEntry(date=date(2024, 1, 6), hours=7.5, quality="fair"),
        SleepEntry(date=date(2024, 1, 7), hours=10.0, quality="excellent"),
    ]
    for entry in entries:
        session.add(entry)
    session.commit()
    for entry in entries:
        session.refresh(entry)
    return entries


@pytest.fixture(name="exercise_entries")
def exercise_entries_fixture(session: Session):
    """
    Create comprehensive exercise entries for all filter tests.
    Covers various dates, steps, duration, and calories burned.
    """
    entries = [
        ExerciseEntry(date=date(2024, 1, 1), steps=3000, duration_min=20.0, calories_burned=150.0),
        ExerciseEntry(date=date(2024, 1, 2), steps=5000, duration_min=30.0, calories_burned=250.0),
        ExerciseEntry(date=date(2024, 1, 3), steps=6000, duration_min=35.0, calories_burned=300.0),
        ExerciseEntry(date=date(2024, 1, 4), steps=8000, duration_min=45.0, calories_burned=400.0),
        ExerciseEntry(date=date(2024, 1, 5), steps=10000, duration_min=60.0, calories_burned=500.0),
        ExerciseEntry(date=date(2024, 1, 6), steps=12000, duration_min=75.0, calories_burned=600.0),
        ExerciseEntry(date=date(2024, 1, 7), steps=15000, duration_min=90.0, calories_burned=750.0),
    ]
    for entry in entries:
        session.add(entry)
    session.commit()
    for entry in entries:
        session.refresh(entry)
    return entries


@pytest.fixture(name="diet_entries")
def diet_entries_fixture(session: Session):
    """
    Create comprehensive diet entries for all filter tests.
    Covers various dates, calories, and macronutrients.
    """
    entries = [
        DietEntry(date=date(2024, 1, 1), calories=1500.0, protein_g=75.0, carbs_g=150.0, fat_g=50.0),
        DietEntry(date=date(2024, 1, 2), calories=1800.0, protein_g=90.0, carbs_g=180.0, fat_g=60.0),
        DietEntry(date=date(2024, 1, 3), calories=1900.0, protein_g=95.0, carbs_g=200.0, fat_g=65.0),
        DietEntry(date=date(2024, 1, 4), calories=2000.0, protein_g=100.0, carbs_g=220.0, fat_g=70.0),
        DietEntry(date=date(2024, 1, 5), calories=2200.0, protein_g=110.0, carbs_g=240.0, fat_g=80.0),
        DietEntry(date=date(2024, 1, 6), calories=2500.0, protein_g=125.0, carbs_g=280.0, fat_g=90.0),
        DietEntry(date=date(2024, 1, 7), calories=2800.0, protein_g=140.0, carbs_g=320.0, fat_g=100.0),
    ]
    for entry in entries:
        session.add(entry)
    session.commit()
    for entry in entries:
        session.refresh(entry)
    return entries


# CSV File Fixtures for Upload Testing

@pytest.fixture(name="valid_sleep_csv")
def valid_sleep_csv_fixture():
    """Create a valid sleep.csv file for upload testing"""
    csv_content = """date,hours,quality
2024-01-01,7.5,good
2024-01-02,8.0,excellent
2024-01-03,6.5,poor"""
    return BytesIO(csv_content.encode())


@pytest.fixture(name="valid_diet_csv")
def valid_diet_csv_fixture():
    """Create a valid diet.csv file for upload testing"""
    csv_content = """date,calories,protein_g,carbs_g,fat_g
2024-01-01,2000,100,250,70
2024-01-02,2200,110,260,75
2024-01-03,1800,90,220,60"""
    return BytesIO(csv_content.encode())


@pytest.fixture(name="valid_exercise_csv")
def valid_exercise_csv_fixture():
    """Create a valid exercise.csv file for upload testing"""
    csv_content = """date,steps,duration_min,calories_burned
2024-01-01,10000,60,500
2024-01-02,12000,75,600
2024-01-03,8000,45,400"""
    return BytesIO(csv_content.encode())


@pytest.fixture(name="invalid_csv_missing_columns")
def invalid_csv_missing_columns_fixture():
    """Create a CSV with missing required columns"""
    csv_content = """date,hours
2024-01-01,7.5
2024-01-02,8.0"""
    return BytesIO(csv_content.encode())


@pytest.fixture(name="invalid_csv_wrong_data_types")
def invalid_csv_wrong_data_types_fixture():
    """Create a CSV with wrong data types"""
    csv_content = """date,hours,quality
2024-01-01,not_a_number,good
2024-01-02,8.0,excellent"""
    return BytesIO(csv_content.encode())


@pytest.fixture(name="empty_csv")
def empty_csv_fixture():
    """Create an empty CSV file"""
    csv_content = ""
    return BytesIO(csv_content.encode())


@pytest.fixture(name="csv_with_headers_only")
def csv_with_headers_only_fixture():
    """Create a CSV with only headers"""
    csv_content = """date,hours,quality"""
    return BytesIO(csv_content.encode())