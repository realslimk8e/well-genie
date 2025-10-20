from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlmodel import Session

from app.database import get_session
from app.services.validators import DocumentValidator
from app.services.ingest import IngestService

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...),
                      session: Session = Depends(get_session)):
    """Upload + validate + add CSV file into SQLite.
    Supports: sleep.csv, diet.csv, exercise.csv"""

    validator = DocumentValidator()
    validation = await validator.validate_file(file)

    if not validation["valid"]:
            raise HTTPException(
                status_code=400,
                detail={
                    "errors": validation["errors"],
                    "detected_headers": validation.get("detected_headers"),
                },
            )

    ingest_service = IngestService()
    result = await ingest_service.ingest_csv(
        file=file, category=validation["category"], session=session
    )

    return {
        "message": "Upload successful", "filename": file.filename, "category": validation["category"],
        "inserted": result["inserted"], "errors": result["errors"] if result["errors"] else None,
    }
