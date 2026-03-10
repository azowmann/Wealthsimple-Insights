from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from backend.database import get_db

router = APIRouter()


@router.post("/upload")
async def upload_portfolio(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Phase 3 — OCR service will be called here
    return {"message": "Upload received", "filename": file.filename}