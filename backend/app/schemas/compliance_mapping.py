from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class ComplianceMappingBase(BaseModel):
    framework: Literal['HIPAA', 'HITRUST', 'NIST 800-53', 'CIS Azure', 'SOC2']
    control_id: str
    control_name: str
    description: Optional[str] = None
    protected_system_id: Optional[int] = None
    firewall_rule_set_id: Optional[int] = None
    compliance_status: Literal['Compliant', 'Non-Compliant', 'Partially Compliant', 'Not Assessed']
    last_assessed_at: Optional[datetime] = None
    assessor: Optional[str] = None
    notes: Optional[str] = None


class ComplianceMappingCreate(ComplianceMappingBase):
    pass


class ComplianceMappingUpdate(BaseModel):
    framework: Optional[Literal['HIPAA', 'HITRUST', 'NIST 800-53', 'CIS Azure', 'SOC2']] = None
    control_id: Optional[str] = None
    control_name: Optional[str] = None
    description: Optional[str] = None
    protected_system_id: Optional[int] = None
    firewall_rule_set_id: Optional[int] = None
    compliance_status: Optional[Literal['Compliant', 'Non-Compliant', 'Partially Compliant', 'Not Assessed']] = None
    last_assessed_at: Optional[datetime] = None
    assessor: Optional[str] = None
    notes: Optional[str] = None


class ComplianceMappingRead(ComplianceMappingBase):
    model_config = ConfigDict(from_attributes=True)

    compliance_mapping_id: int
    evidence_file_url: Optional[str] = None
