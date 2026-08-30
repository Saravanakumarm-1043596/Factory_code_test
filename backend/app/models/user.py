"""SQLAlchemy model for User, generated from the field spec."""
from __future__ import annotations

from sqlalchemy import Column, Boolean, DateTime, Integer, String

from app.database import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    username = Column(String, nullable=False)
    email = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    department = Column(String, nullable=False)
    is_active = Column(Boolean, nullable=False)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False)
