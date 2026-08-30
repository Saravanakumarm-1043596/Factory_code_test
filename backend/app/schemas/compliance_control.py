from __future__ import annotations

from datetime import date, datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class ComplianceControlBase(BaseModel):
    control_framework: Literal['HIPAA §164.312', 'HITRUST CSF 09.x', 'Internal Policy']
    control_identifier: str
    control_name: str
    description: str
    control_category: Literal['Access Control', 'Audit Controls', 'Integrity', 'Transmission Security', 'Encryption', 'Authentication']
    status: Literal['Compliant', 'Non-Compliant', 'Partially Compliant', 'Not Assessed']
    risk_level: Literal['Low', 'Medium', 'High', 'Critical']
    last_assessment_date: Optional[date] = None
    next_assessment_date: Optional[date] = None
    responsible_party: str
    remediation_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ComplianceControlCreate(ComplianceControlBase):
    pass


class ComplianceControlUpdate(BaseModel):
    control_framework: Optional[Literal['HIPAA §164.312', 'HITRUST CSF 09.x', 'Internal Policy']] = None
    control_identifier: Optional[str] = None
    control_name: Optional[str] = None
    description: Optional[str] = None
    control_category: Optional[Literal['Access Control', 'Audit Controls', 'Integrity', 'Transmission Security', 'Encryption', 'Authentication']] = None
    status: Optional[Literal['Compliant', 'Non-Compliant', 'Partially Compliant', 'Not Assessed']] = None
    risk_level: Optional[Literal['Low', 'Medium', 'High', 'Critical']] = None
    last_assessment_date: Optional[date] = None
    next_assessment_date: Optional[date] = None
    responsible_party: Optional[str] = None
    remediation_notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class ComplianceControlRead(ComplianceControlBase):
    model_config = ConfigDict(from_attributes=True)

    compliance_control_id: int
    evidence_document_url: Optional[str] = None
