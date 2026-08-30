"""Shared pytest fixtures: an isolated SQLite test database, and a
TestClient wired to it instead of the real app.db."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from main import app

_TEST_DATABASE_URL = "sqlite:///./test_app.db"
_engine = create_engine(_TEST_DATABASE_URL, connect_args={"check_same_thread": False})
_TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)


def _override_get_db():
    db = _TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session", autouse=True)
def _setup_test_database():
    Base.metadata.create_all(bind=_engine)
    yield
    Base.metadata.drop_all(bind=_engine)


@pytest.fixture()
def client():
    app.dependency_overrides[get_db] = _override_get_db
    # No `with` block: skips the app's lifespan/startup event entirely, so
    # tests never touch the real app.db or its seed data.
    test_client = TestClient(app)
    yield test_client
    app.dependency_overrides.clear()
