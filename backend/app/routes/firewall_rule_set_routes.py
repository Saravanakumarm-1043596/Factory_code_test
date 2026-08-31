"""REST routes for FirewallRuleSet, mounted at /api/firewallrulesets."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from modules.orchestrator.fullstack.schemas.firewall_rule_set import FirewallRuleSetCreate, FirewallRuleSetRead, FirewallRuleSetUpdate
from app.services import firewall_rule_set_service as service

router = APIRouter(prefix="/api/firewallrulesets", tags=["FirewallRuleSet"])


@router.get("", response_model=list[FirewallRuleSetRead])
def list_firewallRuleSet(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return service.list_all(db, skip=skip, limit=limit)


@router.get("/{item_id}", response_model=FirewallRuleSetRead)
def get_firewallRuleSet(item_id: int, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Firewall Rule Set not found")
    return obj


@router.post("", response_model=FirewallRuleSetRead, status_code=status.HTTP_201_CREATED)
def create_firewallRuleSet(payload: FirewallRuleSetCreate, db: Session = Depends(get_db)):
    return service.create(db, payload.model_dump())


@router.put("/{item_id}", response_model=FirewallRuleSetRead)
def update_firewallRuleSet(item_id: int, payload: FirewallRuleSetUpdate, db: Session = Depends(get_db)):
    obj = service.update(db, item_id, payload.model_dump(exclude_unset=True))
    if obj is None:
        raise HTTPException(status_code=404, detail="Firewall Rule Set not found")
    return obj


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_firewallRuleSet(item_id: int, db: Session = Depends(get_db)):
    ok = service.delete(db, item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Firewall Rule Set not found")
    return None
