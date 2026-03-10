# test_connection.py
from backend.database import engine, create_tables
from backend.models import portfolio  # noqa — imports models so Base knows about them
from sqlalchemy import text

try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print("✅ Database connection successful!")
    create_tables()
    print("✅ Tables created successfully!")
except Exception as e:
    print(f"❌ Something went wrong: {e}")