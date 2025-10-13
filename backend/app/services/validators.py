from pathlib import Path
from fastapi import UploadFile
import csv


EXPECTED_HEADERS = {
    "sleep": {"date", "hours", "quality"},
    "diet": {"date", "calories", "protein_g", "carbs_g", "fat_g"},
    "exercise": {"date", "steps", "duration_min", "calories_burned"},
}

class DocumentValidator:
    def __init__(self, max_size: int= 10*1024*1024):
        self.max_size = max_size
        self.allowed_extensions = {'.csv'}
        
    async def validate_file(self, file: UploadFile) -> dict:
        """Detect file type, validate headers, and preview CSV"""
        result = {"valid": True, "errors": []}
        
        #Validate extension 
        extension = Path(file.filename).suffix.lower()
        if extension not in self.allowed_extensions:
            result["valid"] = False
            result["errors"].append(f"Invalid file type: {extension}. Only .csv allowed.")
            return result
        
        #read first line
        first_chunk = await file.read(1024)
        await file.seek(0) 
        
        
        try:
            decoded = first_chunk.decode("utf-8").splitlines()
            if not decoded:
                raise ValueError("Empty file.")
            header_line = decoded[0]
            headers = [h.strip().lower() for h in header_line.split(",")]
        except Exception as e:
            return {"valid": False, "errors": [f"Error reading file header: {e}"]}
        
        #try to detect the file category
        detected = None
        for category, expected_headers in EXPECTED_HEADERS.items():
            if set(headers) == expected_headers:
                detected = category
                break

        if not detected:
            return {
                "valid": False,
                "errors": [f"Header does not match any known format."],
                "detected_headers": headers,
                "expected_formats": EXPECTED_HEADERS,
            }
            
        result["category"] = detected
        result["headers"] = headers
        return result