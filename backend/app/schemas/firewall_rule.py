from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class FirewallRuleBase(BaseModel):
    firewall_rule_set_id: int
    rule_name: str
    priority: int
    direction: Literal['Inbound', 'Outbound']
    action: Literal['Allow', 'Deny']
    protocol: Literal['TCP', 'UDP', 'ICMP', 'Any']
    source_address: str
    source_port_range: str
    destination_address: str
    destination_port_range: str
    is_enabled: bool
    description: Optional[str] = None
    last_hit_at: Optional[datetime] = None
    hit_count: Optional[int] = None
    created_at: datetime


class FirewallRuleCreate(FirewallRuleBase):
    pass


class FirewallRuleUpdate(BaseModel):
    firewall_rule_set_id: Optional[int] = None
    rule_name: Optional[str] = None
    priority: Optional[int] = None
    direction: Optional[Literal['Inbound', 'Outbound']] = None
    action: Optional[Literal['Allow', 'Deny']] = None
    protocol: Optional[Literal['TCP', 'UDP', 'ICMP', 'Any']] = None
    source_address: Optional[str] = None
    source_port_range: Optional[str] = None
    destination_address: Optional[str] = None
    destination_port_range: Optional[str] = None
    is_enabled: Optional[bool] = None
    description: Optional[str] = None
    last_hit_at: Optional[datetime] = None
    hit_count: Optional[int] = None
    created_at: Optional[datetime] = None


class FirewallRuleRead(FirewallRuleBase):
    model_config = ConfigDict(from_attributes=True)

    firewall_rule_id: int
