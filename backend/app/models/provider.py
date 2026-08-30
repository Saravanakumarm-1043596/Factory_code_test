"""SQLAlchemy model for Provider, generated from the field spec."""
from __future__ import annotations

from sqlalchemy import Column, Boolean, DateTime, Integer, String, Text

from app.database import Base


class Provider(Base):
    __tablename__ = "providers"

    provider_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    npi = Column(String, nullable=False)
    provider_name = Column(String, nullable=False)
    provider_type = Column(String, nullable=False)
    tax_id = Column(String, nullable=False)
    clia_number = Column(String, nullable=True)
    network_status = Column(String, nullable=False)
    address = Column(Text, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    is_active = Column(Boolean, nullable=False)
    created_at = Column(DateTime, nullable=False)
