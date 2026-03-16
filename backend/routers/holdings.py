from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.portfolio import Holding
from uuid import UUID

router = APIRouter()


@router.get("/{portfolio_id}")
def get_holdings(portfolio_id: UUID, db: Session = Depends(get_db)):
    holdings = db.query(Holding).filter(
        Holding.portfolio_id == portfolio_id
    ).all()

    if not holdings:
        raise HTTPException(status_code=404, detail="No holdings found for this portfolio.")

    return [
        {
            "id": str(h.id),
            "ticker": h.ticker,
            "shares": h.shares,
            "market_value": h.market_value,
            "gain_loss_pct": h.gain_loss_pct,
            "currency": h.currency,
            "sector": h.sector,
            "beta": h.beta,
            "dividend_yield": h.dividend_yield,
        }
        for h in holdings
    ]