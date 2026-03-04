from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlmodel import Session

from app.database import get_session
from app.routers.auth import get_current_user
from app.models import User
from app.services.validators import DocumentValidator
from app.services.ingest import IngestService

router = APIRouter()

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
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
    assert current_user.id is not None
    result = await ingest_service.ingest_csv(
        file=file,
        category=validation["category"],
        session=session,
        user_id=current_user.id,
    )

    return {
        "message": "Upload successful",
        "filename": file.filename,
        "category": validation["category"],
        "inserted": result["inserted"],
        "errors": result["errors"] if result["errors"] else None,
    }