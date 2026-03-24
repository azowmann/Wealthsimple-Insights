from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from backend.database import Base
from datetime import datetime
import uuid
    
class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    filename = Column(Text, nullable=False)
    status = Column(String, default="processing")  # processing / complete / failed

    holdings = relationship("Holding", back_populates="portfolio", cascade="all, delete")
    metrics = relationship("Metrics", back_populates="portfolio", cascade="all, delete", uselist=False)


class Holding(Base):
    __tablename__ = "holdings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    portfolio_id = Column(UUID(as_uuid=True), ForeignKey("portfolios.id"), nullable=False)
    ticker = Column(String, nullable=False)
    currency = Column(String, nullable=True)
    shares = Column(Float)
    market_value = Column(Float)
    avg_buy_price = Column(Float)
    gain_loss_pct = Column(Float)

    # Enriched fields — filled after yfinance call
    sector = Column(String, nullable=True)
    beta = Column(Float, nullable=True)
    dividend_yield = Column(Float, nullable=True)

    portfolio = relationship("Portfolio", back_populates="holdings")

class Metrics(Base):
    __tablename__ = "metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    portfolio_id = Column(UUID(as_uuid=True), ForeignKey("portfolios.id"), nullable=False)
    sharpe_ratio = Column(Float, nullable=True)
    portfolio_beta = Column(Float, nullable=True)
    max_drawdown = Column(Float, nullable=True)

    # Quantitative data
    sector_data = Column(JSONB, nullable=True)
    correlation = Column(JSONB, nullable=True)

    # AI-generated analysis — stored as JSONB so we keep structure
    # Shape: { health_score, health_summary, strengths, risk_flags, recommendations }
    ai_analysis = Column(JSONB, nullable=True)

    computed_at = Column(DateTime, default=datetime.utcnow)

    portfolio = relationship("Portfolio", back_populates="metrics")