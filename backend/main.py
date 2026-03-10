from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import portfolio, holdings, metrics
from backend.database import create_tables

# Create all tables on startup if they don't exist yet
create_tables()

app = FastAPI(
    title="Wealthsimple Portfolio Analyzer",
    description="Upload your Wealthsimple screenshots and get deep portfolio analytics.",
    version="1.0.0"
)

# CORS middleware allows your React frontend (running on a different port)
# to make requests to this backend. Without this, the browser blocks them.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers — each one owns a specific domain of your API
app.include_router(portfolio.router, prefix="/portfolio", tags=["Portfolio"])
app.include_router(holdings.router, prefix="/holdings", tags=["Holdings"])
app.include_router(metrics.router, prefix="/metrics", tags=["Metrics"])

@app.get("/")
def root():
    return {"message": "Wealthsimple Analyzer API is running"}