import pytest
from app.services.auth import verify_password, get_password_hash

def test_get_password_hash():
    password = "securepassword"
    hashed_password = get_password_hash(password)

    assert hashed_password != password  # Ensure the hash is different from the plain password
    assert len(hashed_password) > 0  # Ensure the hash is not empty

def test_verify_password():
    password = "securepassword"
    hashed_password = get_password_hash(password)

    assert verify_password(password, hashed_password)  # Ensure the password matches the hash
    assert not verify_password("wrongpassword", hashed_password)  # Ensure a wrong password does not match