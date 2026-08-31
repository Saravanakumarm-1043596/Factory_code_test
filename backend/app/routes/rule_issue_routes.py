"""REST routes for RuleIssue, mounted at /api/ruleissues."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from modules.orchestrator.fullstack.schemas.rule_issue import RuleIssueCreate, RuleIssueRead, RuleIssueUpdate
from app.services import rule_issue_service as service

router = APIRouter(prefix="/api/ruleissues", tags=["RuleIssue"])


@router.get("", response_model=list[RuleIssueRead])
def list_ruleIssue(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return service.list_all(db, skip=skip, limit=limit)


@router.get("/{item_id}", response_model=RuleIssueRead)
def get_ruleIssue(item_id: int, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Rule Issue not found")
    return obj


@router.post("", response_model=RuleIssueRead, status_code=status.HTTP_201_CREATED)
def create_ruleIssue(payload: RuleIssueCreate, db: Session = Depends(get_db)):
    return service.create(db, payload.model_dump())


@router.put("/{item_id}", response_model=RuleIssueRead)
def update_ruleIssue(item_id: int, payload: RuleIssueUpdate, db: Session = Depends(get_db)):
    obj = service.update(db, item_id, payload.model_dump(exclude_unset=True))
    if obj is None:
        raise HTTPException(status_code=404, detail="Rule Issue not found")
    return obj


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ruleIssue(item_id: int, db: Session = Depends(get_db)):
    ok = service.delete(db, item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Rule Issue not found")
    return None
