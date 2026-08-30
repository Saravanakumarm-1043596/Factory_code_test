"""REST routes for ClaimLine, mounted at /api/claimlines."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from modules.orchestrator.fullstack.schemas.claim_line import ClaimLineCreate, ClaimLineRead, ClaimLineUpdate
from app.services import claim_line_service as service

router = APIRouter(prefix="/api/claimlines", tags=["ClaimLine"])


@router.get("", response_model=list[ClaimLineRead])
def list_claimLine(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return service.list_all(db, skip=skip, limit=limit)


@router.get("/{item_id}", response_model=ClaimLineRead)
def get_claimLine(item_id: int, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Claim Line not found")
    return obj


@router.post("", response_model=ClaimLineRead, status_code=status.HTTP_201_CREATED)
def create_claimLine(payload: ClaimLineCreate, db: Session = Depends(get_db)):
    return service.create(db, payload.model_dump())


@router.put("/{item_id}", response_model=ClaimLineRead)
def update_claimLine(item_id: int, payload: ClaimLineUpdate, db: Session = Depends(get_db)):
    obj = service.update(db, item_id, payload.model_dump(exclude_unset=True))
    if obj is None:
        raise HTTPException(status_code=404, detail="Claim Line not found")
    return obj


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_claimLine(item_id: int, db: Session = Depends(get_db)):
    ok = service.delete(db, item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Claim Line not found")
    return None
