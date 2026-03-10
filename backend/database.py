from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# The engine is the core connection to your PostgreSQL database.
# It manages the connection pool — reusing connections rather than
# opening a new one on every request.
engine = create_engine(DATABASE_URL)

# A SessionLocal is a factory that produces individual database sessions.
# Each request to your API gets its own session, uses it, then closes it.
# autocommit=False means changes only persist when you explicitly commit.
# autoflush=False means SQLAlchemy won't automatically push changes mid-session.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base is the class all your SQLAlchemy models will inherit from.
# It keeps a registry of every table you define, which is how
# create_all() knows what to create in the database.
Base = declarative_base()


# This is a dependency function that FastAPI will inject into your routes.
# It yields a session, hands it to the route, then guarantees it closes
# afterward — even if an exception is raised mid-request.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    Base.metadata.create_all(bind=engine)