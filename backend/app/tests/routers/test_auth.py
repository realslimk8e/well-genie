import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import get_session
from app.models import User
from app.services.auth import get_password_hash
from sqlmodel import Session, SQLModel, create_engine

# Test database setup
test_engine = create_engine("sqlite:///:memory:")

def override_get_session():
    with Session(test_engine) as session:
        yield session

app.dependency_overrides[get_session] = override_get_session

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    SQLModel.metadata.create_all(test_engine)
    with Session(test_engine) as session:
        # Seed a test user
        user = User(
            username="testuser",
            hashed_password=get_password_hash("testpassword"),
            email="testuser@example.com"
        )
        session.add(user)
        session.commit()

# Test cases
def test_login_success():
    client = TestClient(app)
    response = client.post("/login", auth=("testuser", "testpassword"))
    assert response.status_code == 200
    assert response.json()["message"] == "Login successful"

def test_login_failure():
    client = TestClient(app)
    response = client.post("/login", auth=("testuser", "wrongpassword"))
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"

def test_logout():
    client = TestClient(app)
    login_response = client.post("/login", auth=("testuser", "testpassword"))
    assert login_response.status_code == 200

    cookies = login_response.cookies
    logout_response = client.post("/logout", cookies=cookies)
    assert logout_response.status_code == 200
    assert logout_response.json()["message"] == "Logout successful"

def test_read_current_user():
    client = TestClient(app)
    login_response = client.post("/login", auth=("testuser", "testpassword"))
    assert login_response.status_code == 200

    cookies = login_response.cookies
    me_response = client.get("/me", cookies=cookies)
    assert me_response.status_code == 200
    assert me_response.json()["username"] == "testuser"