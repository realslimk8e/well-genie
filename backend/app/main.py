import csv
from fastapi import FastAPI, File, UploadFile, HTTPException
from pathlib import Path
import shutil
from app.services.validators import DocumentValidator

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

app = FastAPI(title="WellGenie API")

@app.get("/")
async def root():
    return {"message": "This is really cool eh!"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload a single file with basic validation"""
    
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
    
    #copy the upload file local folder for now
    file_path = UPLOAD_DIR/file.filename
    
    await file.seek(0)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    #success message
    return {
        "message": "Upload successful",
        "filename": file.filename,
        "category": validation["category"],
        "headers": validation["headers"],
        "location": str(file_path),
        "content_type": file.content_type,
    }