import pytest
from datetime import datetime, timedelta
from app.services.sessions import create_session, get_session, delete_session

# Test data
TEST_USER_ID = 1

# Test cases
def test_create_session():
    token = create_session(TEST_USER_ID)
    session = get_session(token)

    assert session is not None
    assert session["user_id"] == TEST_USER_ID
    assert session["created_at"] <= datetime.now()
    assert session["expires_at"] > datetime.now()

def test_get_session_valid():
    token = create_session(TEST_USER_ID)
    session = get_session(token)

    assert session is not None
    assert session["user_id"] == TEST_USER_ID

def test_get_session_expired():
    token = create_session(TEST_USER_ID)
    # Simulate expiration
    session = get_session(token)
    if session:  # Ensure session is not None
        session["expires_at"] = datetime.now() - timedelta(minutes=1)

    expired_session = get_session(token)
    assert expired_session is None

def test_delete_session():
    token = create_session(TEST_USER_ID)
    delete_session(token)

    session = get_session(token)
    assert session is None