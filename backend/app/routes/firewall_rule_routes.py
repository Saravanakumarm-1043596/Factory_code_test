"""REST routes for FirewallRule, mounted at /api/firewallrules."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from modules.orchestrator.fullstack.schemas.firewall_rule import FirewallRuleCreate, FirewallRuleRead, FirewallRuleUpdate
from app.services import firewall_rule_service as service

router = APIRouter(prefix="/api/firewallrules", tags=["FirewallRule"])


@router.get("", response_model=list[FirewallRuleRead])
def list_firewallRule(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return service.list_all(db, skip=skip, limit=limit)


@router.get("/{item_id}", response_model=FirewallRuleRead)
def get_firewallRule(item_id: int, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Firewall Rule not found")
    return obj


@router.post("", response_model=FirewallRuleRead, status_code=status.HTTP_201_CREATED)
def create_firewallRule(payload: FirewallRuleCreate, db: Session = Depends(get_db)):
    return service.create(db, payload.model_dump())


@router.put("/{item_id}", response_model=FirewallRuleRead)
def update_firewallRule(item_id: int, payload: FirewallRuleUpdate, db: Session = Depends(get_db)):
    obj = service.update(db, item_id, payload.model_dump(exclude_unset=True))
    if obj is None:
        raise HTTPException(status_code=404, detail="Firewall Rule not found")
    return obj


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_firewallRule(item_id: int, db: Session = Depends(get_db)):
    ok = service.delete(db, item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Firewall Rule not found")
    return None
