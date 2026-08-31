from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class FirewallRuleSetBase(BaseModel):
    name: str
    description: Optional[str] = None
    network_security_group_id: Optional[int] = None
    appliance_id: Optional[int] = None
    protected_system_id: Optional[int] = None
    rule_count: int
    status: Literal['Active', 'Under Review', 'Deprecated', 'Archived']
    last_reviewed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class FirewallRuleSetCreate(FirewallRuleSetBase):
    pass


class FirewallRuleSetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    network_security_group_id: Optional[int] = None
    appliance_id: Optional[int] = None
    protected_system_id: Optional[int] = None
    rule_count: Optional[int] = None
    status: Optional[Literal['Active', 'Under Review', 'Deprecated', 'Archived']] = None
    last_reviewed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class FirewallRuleSetRead(FirewallRuleSetBase):
    model_config = ConfigDict(from_attributes=True)

    firewall_rule_set_id: int
