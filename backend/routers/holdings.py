from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from uuid import UUID

router = APIRouter()


@router.get("/{portfolio_id}")
def get_holdings(portfolio_id: UUID, db: Session = Depends(get_db)):
    # Phase 4 — will query holdings from DB and return enriched data
    return {"message": "Holdings endpoint ready", "portfolio_id": str(portfolio_id)}