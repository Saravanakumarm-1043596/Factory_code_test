"""REST routes for ScanFinding, mounted at /api/scanfindings."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from modules.orchestrator.fullstack.schemas.scan_finding import ScanFindingCreate, ScanFindingRead, ScanFindingUpdate
from app.services import scan_finding_service as service

router = APIRouter(prefix="/api/scanfindings", tags=["ScanFinding"])


@router.get("", response_model=list[ScanFindingRead])
def list_scanFinding(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return service.list_all(db, skip=skip, limit=limit)


@router.get("/{item_id}", response_model=ScanFindingRead)
def get_scanFinding(item_id: int, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Scan Finding not found")
    return obj


@router.post("", response_model=ScanFindingRead, status_code=status.HTTP_201_CREATED)
def create_scanFinding(payload: ScanFindingCreate, db: Session = Depends(get_db)):
    return service.create(db, payload.model_dump())


@router.put("/{item_id}", response_model=ScanFindingRead)
def update_scanFinding(item_id: int, payload: ScanFindingUpdate, db: Session = Depends(get_db)):
    obj = service.update(db, item_id, payload.model_dump(exclude_unset=True))
    if obj is None:
        raise HTTPException(status_code=404, detail="Scan Finding not found")
    return obj


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scanFinding(item_id: int, db: Session = Depends(get_db)):
    ok = service.delete(db, item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Scan Finding not found")
    return None
