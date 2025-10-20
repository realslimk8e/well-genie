from pathlib import Path
from fastapi import UploadFile
from datetime import datetime
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
        extension = Path(file.filename if file.filename else "").suffix.lower()
        if extension not in self.allowed_extensions:
            result["valid"] = False
            result["errors"].append(f"Invalid file type: {extension}. Only .csv allowed.")
            return result
        
        content = await file.read()
        await file.seek(0)
        
        if not content:
            return {"valid": False, "errors": ["Empty file."]}
        
        try:
            decoded = content.decode("utf-8").splitlines()
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
            
        if len(decoded) < 2:
            return {
                "valid": False,
                "errors": ["CSV contains only headers with no data rows."],
                "category": detected
            }
            
        reader = csv.DictReader(decoded)
        row_errors = []
            
        for row_num, row in enumerate(reader, start=2):  # start=2 because row 1 is header
            cleaned_row = {k.strip().lower(): v.strip() for k, v in row.items()}
            
            row_error = self._validate_row(cleaned_row, detected, row_num)
            if row_error:
                row_errors.append(row_error)
        
        # If there are validation errors, fail the upload
        if row_errors:
            return {
                "valid": False,
                "errors": row_errors,
                "category": detected,
                "detected_headers": headers
            }
            
        result["category"] = detected
        result["headers"] = headers
        return result
    
    def _validate_row(self, row: dict, category: str, row_num: int) -> str:
        """Validate a single row's data types and values"""
        try:
            if "date" not in row or not row["date"]:
                return f"Row {row_num}: Missing 'date' field"
            
            try:
                datetime.strptime(row["date"], "%Y-%m-%d")
            except ValueError:
                return f"Row {row_num}: Invalid date format '{row['date']}'. Expected YYYY-MM-DD"
            
            if category == "sleep":
                if "hours" not in row or not row["hours"]:
                    return f"Row {row_num}: Missing 'hours' field"
                try:
                    hours = float(row["hours"])
                    if hours < 0 or hours > 24:
                        return f"Row {row_num}: Hours must be between 0 and 24"
                except ValueError:
                    return f"Row {row_num}: Invalid hours value '{row['hours']}'. Must be a number"
                
                if "quality" not in row or not row["quality"]:
                    return f"Row {row_num}: Missing 'quality' field"
            
            elif category == "diet":
                for field in ["calories", "protein_g", "carbs_g", "fat_g"]:
                    if field not in row or not row[field]:
                        return f"Row {row_num}: Missing '{field}' field"
                    try:
                        value = float(row[field])
                        if value < 0:
                            return f"Row {row_num}: {field} cannot be negative"
                    except ValueError:
                        return f"Row {row_num}: Invalid {field} value '{row[field]}'. Must be a number"
            
            elif category == "exercise":
                if "steps" not in row or not row["steps"]:
                    return f"Row {row_num}: Missing 'steps' field"
                try:
                    steps = int(row["steps"])
                    if steps < 0:
                        return f"Row {row_num}: Steps cannot be negative"
                except ValueError:
                    return f"Row {row_num}: Invalid steps value '{row['steps']}'. Must be an integer"
                
                for field in ["duration_min", "calories_burned"]:
                    if field not in row or not row[field]:
                        return f"Row {row_num}: Missing '{field}' field"
                    try:
                        value = float(row[field])
                        if value < 0:
                            return f"Row {row_num}: {field} cannot be negative"
                    except ValueError:
                        return f"Row {row_num}: Invalid {field} value '{row[field]}'. Must be a number"
            
            return ""  # No errors
        except Exception as e:
            return f"Row {row_num}: Unexpected error - {str(e)}"