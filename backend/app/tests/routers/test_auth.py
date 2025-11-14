import pytest
from fastapi.testclient import TestClient
from app.database import get_session
from app.models import User
from app.services.auth import get_password_hash
from sqlmodel import Session, SQLModel, create_engine
from sqlalchemy.pool import StaticPool


@pytest.fixture(name="auth_session")
def auth_session_fixture():
    """Create a fresh test database session for each test"""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    
    with Session(engine) as session:
        # Seed a test user
        user = User(
            username="testuser",
            hashed_password=get_password_hash("testpassword"),
            email="testuser@example.com"
        )
        session.add(user)
        session.commit()
        
        yield session


@pytest.fixture(name="auth_client")
def auth_client_fixture(auth_session: Session):
    """Create a test client with isolated database for each test"""
    from app.main import app
    
    def get_session_override():
        return auth_session
    
    app.dependency_overrides[get_session] = get_session_override
    
    with TestClient(app) as client:
        yield client
    
    app.dependency_overrides.clear()


class TestLogin:
    """Test login endpoint"""
    
    def test_login_success(self, auth_client: TestClient):
        """Test successful login with correct credentials using Basic Auth."""
        response = auth_client.post("/api/login", auth=("testuser", "testpassword"))
        
        assert response.status_code == 200
        assert response.json() == {"message": "Login successful", "username": "testuser"}
        assert "session" in response.cookies
        # Verify session cookie properties
        session_cookie = response.cookies.get("session")
        assert session_cookie is not None
        assert len(session_cookie) > 0
    
    def test_login_failure_wrong_password(self, auth_client: TestClient):
        """Test failed login with incorrect password."""
        response = auth_client.post("/api/login", auth=("testuser", "wrongpassword"))
        
        assert response.status_code == 401
        assert response.json()["detail"] == "Incorrect username or password"
        assert "session" not in response.cookies
    
    def test_login_failure_wrong_username(self, auth_client: TestClient):
        """Test failed login with incorrect username."""
        response = auth_client.post("/api/login", auth=("wronguser", "testpassword"))
        
        assert response.status_code == 401
        assert response.json()["detail"] == "Incorrect username or password"
    
    def test_login_no_auth_header(self, auth_client: TestClient):
        """Test failed login when no Authorization header is provided."""
        response = auth_client.post("/api/login")
        
        assert response.status_code == 400
        assert response.json()["detail"] == "Missing authorization header"
    
    def test_login_malformed_auth_header(self, auth_client: TestClient):
        """Test failed login with malformed Authorization header."""
        response = auth_client.post(
            "/api/login",
            headers={"Authorization": "NotBasic invalid"}
        )
        
        assert response.status_code == 400
        assert "detail" in response.json()


class TestProtectedEndpoints:
    """Test accessing protected endpoints"""
    
    def test_access_protected_route_without_auth(self, auth_client: TestClient):
        """Test accessing /api/me without authentication fails."""
        response = auth_client.get("/api/me")
        
        assert response.status_code == 401
        assert response.json()["detail"] == "Not authenticated"
    
    def test_access_protected_route_with_auth(self, auth_client: TestClient):
        """Test accessing a protected route after logging in."""
        # First, log in to get the session cookie
        login_response = auth_client.post("/api/login", auth=("testuser", "testpassword"))
        assert login_response.status_code == 200
        
        # The TestClient automatically handles cookies, so the next request will be authenticated
        me_response = auth_client.get("/api/me")
        
        assert me_response.status_code == 200
        assert me_response.json()["username"] == "testuser"
        assert me_response.json()["email"] == "testuser@example.com"
        assert "id" in me_response.json()
    
    def test_access_protected_route_with_invalid_session(self, auth_client: TestClient):
        """Test accessing protected route with invalid session token."""
        # Set a fake session cookie
        auth_client.cookies.set("session", "invalid_token_12345")
        
        response = auth_client.get("/api/me")
        
        assert response.status_code == 401
        assert response.json()["detail"] == "Invalid or expired session"


class TestLogout:
    """Test logout functionality"""
    
    def test_logout_success(self, auth_client: TestClient):
        """Test successful logout."""
        # Log in first
        login_response = auth_client.post("/api/login", auth=("testuser", "testpassword"))
        assert login_response.status_code == 200
        
        # Then log out
        logout_response = auth_client.post("/api/logout")
        
        assert logout_response.status_code == 200
        assert logout_response.json() == {"message": "Logout successful"}
    
    def test_logout_clears_session(self, auth_client: TestClient):
        """Test that logout clears the session and prevents access."""
        # Log in first
        auth_client.post("/api/login", auth=("testuser", "testpassword"))
        
        # Verify we can access protected route
        me_response_before = auth_client.get("/api/me")
        assert me_response_before.status_code == 200
        
        # Log out
        auth_client.post("/api/logout")
        
        # Verify that accessing a protected route now fails
        me_response_after = auth_client.get("/api/me")
        assert me_response_after.status_code == 401
        assert me_response_after.json()["detail"] == "Not authenticated"
    
    def test_logout_without_session(self, auth_client: TestClient):
        """Test logout without being logged in."""
        response = auth_client.post("/api/logout")
        
        # Should still succeed (idempotent operation)
        assert response.status_code == 200
        assert response.json() == {"message": "Logout successful"}


class TestSessionPersistence:
    """Test session persistence across requests"""
    
    def test_session_persists_across_requests(self, auth_client: TestClient):
        """Test that session cookie persists and works across multiple requests."""
        # Log in
        login_response = auth_client.post("/api/login", auth=("testuser", "testpassword"))
        assert login_response.status_code == 200
        
        # Make multiple authenticated requests
        for _ in range(3):
            response = auth_client.get("/api/me")
            assert response.status_code == 200
            assert response.json()["username"] == "testuser"
    
    def test_multiple_login_attempts_replace_session(self, auth_client: TestClient):
        """Test that logging in again replaces the old session."""
        # First login
        first_login = auth_client.post("/api/login", auth=("testuser", "testpassword"))
        assert first_login.status_code == 200
        first_session = first_login.cookies.get("session")
        
        # Second login
        second_login = auth_client.post("/api/login", auth=("testuser", "testpassword"))
        assert second_login.status_code == 200
        second_session = second_login.cookies.get("session")
        
        # Sessions should be different
        assert first_session != second_session
        
        # Should still be able to access protected routes
        response = auth_client.get("/api/me")
        assert response.status_code == 200
