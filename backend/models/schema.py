from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime
from uuid import UUID

# --- Holding Schemas ---

class HoldingBase(BaseModel):
    ticker: str
    shares: Optional[float] = None
    market_value: Optional[float] = None
    avg_buy_price: Optional[float] = None
    gain_loss_pct: Optional[float] = None

class HoldingEnriched(HoldingBase):
    id: UUID
    portfolio_id: UUID
    sector: Optional[str] = None
    beta: Optional[float] = None
    dividend_yield: Optional[float] = None

    class Config:
        from_attributes = True

# --- Metrics Schemas ---

class MetricsResponse(BaseModel):
    id: UUID
    portfolio_id: UUID
    sharpe_ratio: Optional[float] = None
    portfolio_beta: Optional[float] = None
    max_drawdown: Optional[float] = None
    sector_data: Optional[Dict] = None
    correlation: Optional[Dict] = None
    computed_at: datetime

    class Config:
        from_attributes = True

# --- Portfolio Schemas ---

class PortfolioResponse(BaseModel):
    id: UUID
    uploaded_at: datetime
    filename: str
    status: str

    class Config:
        from_attributes = True