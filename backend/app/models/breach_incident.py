"""SQLAlchemy model for BreachIncident, generated from the field spec."""
from __future__ import annotations

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Text

from sqlalchemy.orm import relationship

from app.database import Base


class BreachIncident(Base):
    __tablename__ = "breach_incidents"

    breach_incident_id = Column(String, primary_key=True, index=True)
    reported_by_user_id = Column(String, ForeignKey("app_users.app_user_id"), nullable=False)
    severity = Column(String, nullable=False)
    breach_type = Column(String, nullable=False)
    status = Column(String, nullable=False)
    affected_patient_count = Column(Integer, nullable=False)
    description = Column(Text, nullable=False)
    discovered_at = Column(DateTime, nullable=False)
    reported_at = Column(DateTime, nullable=False)
    hhs_notification_deadline = Column(Date, nullable=False)
    hhs_notified_at = Column(DateTime, nullable=True)
    patient_notification_sent_at = Column(DateTime, nullable=True)
    root_cause = Column(Text, nullable=True)
    remediation_plan = Column(Text, nullable=True)
    supporting_document = Column(String, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)

    reported_by_user = relationship("AppUser")
