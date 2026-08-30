"""SQLAlchemy model for LineOfBusiness, generated from the field spec."""
from __future__ import annotations

from sqlalchemy import Column, Boolean, DateTime, Integer, String, Text

from app.database import Base


class LineOfBusiness(Base):
    __tablename__ = "line_of_businesses"

    line_of_business_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    regulatory_framework = Column(String, nullable=False)
    is_active = Column(Boolean, nullable=False)
    created_at = Column(DateTime, nullable=False)
