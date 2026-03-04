"""
tests/test_delete.py

Unit tests for app/services/delete.py
Integration tests for DELETE /api/diet

Run with:
    pytest tests/test_delete.py -v

Requirements:
    pip install pytest httpx sqlmodel fastapi
"""

import pytest
from datetime import date
from sqlmodel import SQLModel, Session, create_engine, select
from fastapi.testclient import TestClient

from app.models import DietEntry, ExerciseEntry, SleepEntry, User
from app.services.delete import delete_diet_records, delete_exercise_records, delete_sleep_records
from app.services.auth import get_password_hash
from app.main import app
from app.database import get_session
from app.routers.auth import get_current_user  # module-level so object identity matches FastAPI's registry


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(name="engine")
def engine_fixture():
    """
    Named in-memory SQLite database shared across all connections in a test.

    WHY NOT sqlite:///:memory:?
    Each connection to :memory: gets its own isolated database. So the session
    that seeds test data and the session the route handler uses would be two
    completely separate databases — seeded rows would be invisible to the route.

    Using a named in-memory DB (?uri=true + cache=shared) makes all connections
    within the same process share one database, solving this.
    """
    engine = create_engine(
        "sqlite:///file:testdb?mode=memory&cache=shared&uri=true",
        connect_args={"check_same_thread": False},
        echo=False,
    )
    SQLModel.metadata.create_all(engine)
    yield engine
    SQLModel.metadata.drop_all(engine)
    engine.dispose()


@pytest.fixture(name="session")
def session_fixture(engine):
    with Session(engine) as session:
        yield session


@pytest.fixture(name="two_users")
def two_users_fixture(session):
    """Two users for cross-user isolation assertions."""
    user_a = User(username="alice", hashed_password=get_password_hash("pass"), email="a@test.com")
    user_b = User(username="bob",   hashed_password=get_password_hash("pass"), email="b@test.com")
    session.add(user_a)
    session.add(user_b)
    session.commit()
    session.refresh(user_a)
    session.refresh(user_b)
    return user_a, user_b


@pytest.fixture(name="test_user")
def test_user_fixture(session):
    """Single user for integration tests."""
    user = User(username="testuser", hashed_password=get_password_hash("testpass"), email="t@test.com")
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture(name="client")
def client_fixture(engine, test_user):
    """
    TestClient with two dependency overrides:

    1. get_session -> same named in-memory DB the session fixture uses,
       so data seeded in tests is visible to the route handler.
    2. get_current_user -> returns test_user directly, bypassing cookie
       and DB lookup entirely.
    """
    def override_get_session():
        with Session(engine) as s:
            yield s

    def override_get_current_user():
        return test_user

    app.dependency_overrides[get_session] = override_get_session
    app.dependency_overrides[get_current_user] = override_get_current_user

    with TestClient(app) as client:
        yield client

    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_diet_entries(session, user_id, entries: list[tuple[date, float]]):
    """Insert DietEntry rows. entries = [(date, calories), ...]"""
    rows = [
        DietEntry(user_id=user_id, date=d, calories=cal, protein_g=0, carbs_g=0, fat_g=0)
        for d, cal in entries
    ]
    for row in rows:
        session.add(row)
    session.commit()
    return rows


def make_exercise_entries(session, user_id, dates: list[date]):
    rows = [
        ExerciseEntry(user_id=user_id, date=d, steps=1000, duration_min=30, calories_burned=200)
        for d in dates
    ]
    for row in rows:
        session.add(row)
    session.commit()
    return rows


def make_sleep_entries(session, user_id, dates: list[date]):
    rows = [
        SleepEntry(user_id=user_id, date=d, hours=7.0, quality="good")
        for d in dates
    ]
    for row in rows:
        session.add(row)
    session.commit()
    return rows


# ===========================================================================
# UNIT TESTS — delete_diet_records
# ===========================================================================

class TestDeleteDietRecords:

    def test_deletes_entries_within_range(self, session, two_users):
        user_a, _ = two_users
        make_diet_entries(session, user_a.id, [
            (date(2024, 1, 10), 2000),
            (date(2024, 1, 15), 2100),
            (date(2024, 1, 20), 1900),
        ])

        count = delete_diet_records(session, date(2024, 1, 10), date(2024, 1, 15), user_a.id)

        assert count == 2
        remaining = session.exec(select(DietEntry).where(DietEntry.user_id == user_a.id)).all()
        assert len(remaining) == 1
        assert remaining[0].date == date(2024, 1, 20)

    def test_does_not_delete_other_users_entries(self, session, two_users):
        user_a, user_b = two_users
        make_diet_entries(session, user_a.id, [(date(2024, 1, 10), 2000)])
        make_diet_entries(session, user_b.id, [(date(2024, 1, 10), 1800)])

        count = delete_diet_records(session, date(2024, 1, 1), date(2024, 1, 31), user_a.id)

        assert count == 1
        b_entries = session.exec(select(DietEntry).where(DietEntry.user_id == user_b.id)).all()
        assert len(b_entries) == 1

    def test_returns_zero_when_no_entries_in_range(self, session, two_users):
        user_a, _ = two_users
        make_diet_entries(session, user_a.id, [(date(2024, 3, 5), 2000)])

        count = delete_diet_records(session, date(2024, 1, 1), date(2024, 1, 31), user_a.id)

        assert count == 0

    def test_inclusive_boundary_dates(self, session, two_users):
        user_a, _ = two_users
        make_diet_entries(session, user_a.id, [
            (date(2024, 1, 1),  2000),  # exactly start_date — deleted
            (date(2024, 1, 31), 2100),  # exactly end_date — deleted
            (date(2024, 2, 1),  1900),  # one day after — survives
        ])

        count = delete_diet_records(session, date(2024, 1, 1), date(2024, 1, 31), user_a.id)

        assert count == 2
        remaining = session.exec(select(DietEntry).where(DietEntry.user_id == user_a.id)).all()
        assert len(remaining) == 1

    def test_empty_table_returns_zero(self, session, two_users):
        user_a, _ = two_users
        count = delete_diet_records(session, date(2024, 1, 1), date(2024, 12, 31), user_a.id)
        assert count == 0

    def test_single_day_range(self, session, two_users):
        user_a, _ = two_users
        make_diet_entries(session, user_a.id, [
            (date(2024, 6, 15), 2000),
            (date(2024, 6, 16), 2100),
        ])

        count = delete_diet_records(session, date(2024, 6, 15), date(2024, 6, 15), user_a.id)

        assert count == 1


# ===========================================================================
# UNIT TESTS — delete_exercise_records
# ===========================================================================

class TestDeleteExerciseRecords:

    def test_deletes_entries_within_range(self, session, two_users):
        user_a, _ = two_users
        make_exercise_entries(session, user_a.id, [
            date(2024, 2, 1),
            date(2024, 2, 10),
            date(2024, 2, 28),
        ])

        count = delete_exercise_records(session, date(2024, 2, 1), date(2024, 2, 10), user_a.id)

        assert count == 2
        remaining = session.exec(select(ExerciseEntry).where(ExerciseEntry.user_id == user_a.id)).all()
        assert len(remaining) == 1

    def test_does_not_delete_other_users_entries(self, session, two_users):
        user_a, user_b = two_users
        make_exercise_entries(session, user_a.id, [date(2024, 2, 1)])
        make_exercise_entries(session, user_b.id, [date(2024, 2, 1)])

        delete_exercise_records(session, date(2024, 1, 1), date(2024, 12, 31), user_a.id)

        b_entries = session.exec(select(ExerciseEntry).where(ExerciseEntry.user_id == user_b.id)).all()
        assert len(b_entries) == 1


# ===========================================================================
# UNIT TESTS — delete_sleep_records
# ===========================================================================

class TestDeleteSleepRecords:

    def test_deletes_entries_within_range(self, session, two_users):
        user_a, _ = two_users
        make_sleep_entries(session, user_a.id, [
            date(2024, 3, 1),
            date(2024, 3, 5),
            date(2024, 3, 10),
        ])

        count = delete_sleep_records(session, date(2024, 3, 1), date(2024, 3, 5), user_a.id)

        assert count == 2

    def test_does_not_delete_other_users_entries(self, session, two_users):
        user_a, user_b = two_users
        make_sleep_entries(session, user_a.id, [date(2024, 3, 1)])
        make_sleep_entries(session, user_b.id, [date(2024, 3, 1)])

        delete_sleep_records(session, date(2024, 1, 1), date(2024, 12, 31), user_a.id)

        b_entries = session.exec(select(SleepEntry).where(SleepEntry.user_id == user_b.id)).all()
        assert len(b_entries) == 1


# ===========================================================================
# INTEGRATION TESTS — DELETE /api/diet route
# ===========================================================================

class TestDeleteDietRoute:

    def test_unauthenticated_request_returns_401(self, engine):
        """
        No get_current_user override here — real auth runs and raises 401
        because no session cookie is present.
        """
        saved = app.dependency_overrides.copy()
        app.dependency_overrides.clear()

        def override_get_session():
            with Session(engine) as s:
                yield s

        app.dependency_overrides[get_session] = override_get_session

        try:
            with TestClient(app) as client:
                response = client.delete("/api/diet?start_date=2024-01-01&end_date=2024-01-31")
        finally:
            app.dependency_overrides.clear()
            app.dependency_overrides.update(saved)

        assert response.status_code == 401

    def test_authenticated_delete_returns_success_message(self, client, test_user, session):
        make_diet_entries(session, test_user.id, [(date(2024, 1, 10), 2000)])

        response = client.delete("/api/diet?start_date=2024-01-01&end_date=2024-01-31")

        assert response.status_code == 200
        data = response.json()
        assert "deleted" in data["message"].lower()
        assert "1" in data["message"]

    def test_delete_removes_correct_rows_from_db(self, client, test_user, session):
        make_diet_entries(session, test_user.id, [
            (date(2024, 1, 10), 2000),
            (date(2024, 1, 20), 2100),
            (date(2024, 2, 5),  1900),  # outside range — must survive
        ])

        client.delete("/api/diet?start_date=2024-01-01&end_date=2024-01-31")

        remaining = session.exec(select(DietEntry).where(DietEntry.user_id == test_user.id)).all()
        assert len(remaining) == 1
        assert remaining[0].date == date(2024, 2, 5)

    def test_delete_does_not_affect_other_users_data(self, client, session, two_users):
        _, user_b = two_users
        make_diet_entries(session, user_b.id, [(date(2024, 1, 10), 1800)])

        client.delete("/api/diet?start_date=2024-01-01&end_date=2024-01-31")

        b_entries = session.exec(select(DietEntry).where(DietEntry.user_id == user_b.id)).all()
        assert len(b_entries) == 1

    def test_delete_with_no_matching_rows_returns_zero(self, client):
        response = client.delete("/api/diet?start_date=2020-01-01&end_date=2020-12-31")
        assert response.status_code == 200
        assert "0" in response.json()["message"]

    def test_missing_date_params_returns_422(self, client):
        response = client.delete("/api/diet?end_date=2024-01-31")
        assert response.status_code == 422

    def test_invalid_date_format_returns_422(self, client):
        response = client.delete("/api/diet?start_date=not-a-date&end_date=2024-01-31")
        assert response.status_code == 422

    def test_start_date_after_end_date_deletes_nothing(self, client, test_user, session):
        make_diet_entries(session, test_user.id, [(date(2024, 1, 10), 2000)])

        response = client.delete("/api/diet?start_date=2024-01-31&end_date=2024-01-01")

        assert response.status_code == 200
        assert "0" in response.json()["message"]