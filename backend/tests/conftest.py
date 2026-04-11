import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db
from app.models.user import User, UserRole
from app.models import project, task  # noqa: F401 - register all models with SQLAlchemy
from app.services.auth_service import hash_password

import os
TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL", "postgresql://kuafu:kuafu_pass@db:5432/kuafu_test")

engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(bind=engine)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()

@pytest.fixture
def client(db):
    def override_get_db():
        yield db
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture
def admin_user(db):
    user = User(name="Admin", email="admin@test.com",
                password_hash=hash_password("admin123"), role=UserRole.admin)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def member_user(db):
    user = User(name="Dev", email="dev@test.com",
                password_hash=hash_password("dev123"), role=UserRole.member)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def admin_token(client, admin_user):
    res = client.post("/api/v1/auth/login", json={"email": "admin@test.com", "password": "admin123"})
    return res.json()["access_token"]

@pytest.fixture
def member_token(client, member_user):
    res = client.post("/api/v1/auth/login", json={"email": "dev@test.com", "password": "dev123"})
    return res.json()["access_token"]
