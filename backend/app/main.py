from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from sqlmodel import SQLModel, Session
from app.routers import sleep, diet, exercise

from app.database import engine, get_session
from app.models import SleepEntry, DietEntry, ExerciseEntry
from app.services.validators import DocumentValidator
from app.services.ingest import IngestService

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

app = FastAPI(title="WellGenie API")
app.include_router(sleep.router, prefix="/api")
app.include_router(diet.router, prefix="/api")
app.include_router(exercise.router, prefix="/api")

# --- Startup
@app.on_event("startup")
def on_startup():
    """Initialize database tables at app startup."""
    SQLModel.metadata.create_all(engine)

# --- Routes
@app.get("/")
async def root():
    return {"message": "This is really cool eh!"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...),
                      session: Session = Depends(get_session)):
    """Upload + validate + add CSV file into SQLite.
    Supports: sleep.csv, diet.csv, exercise.csv"""
    
    validator = DocumentValidator()
    validation = await validator.validate_file(file)
    
    #return error message
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
        file=file,
        category=validation["category"],
        session=session
    )
       
    #success message
    return {
        "message": "Upload successful",
        "filename": file.filename,
        "category": validation["category"],
        "inserted": result["inserted"],
        "errors": result["errors"] if result["errors"] else None,
    }