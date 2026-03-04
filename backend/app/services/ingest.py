import csv
from datetime import datetime
from fastapi import UploadFile
from sqlmodel import Session

from app.models import SleepEntry, DietEntry, ExerciseEntry

class IngestService:
    """Service for ingesting validated CSV data into the database."""
    MODEL_MAP = {
        "sleep": SleepEntry,
        "diet": DietEntry,
        "exercise": ExerciseEntry,
    }
    
    async def ingest_csv(
        self, file: UploadFile, category: str, session: Session, user_id: int
    ) -> dict:
        """
        Ingest validated CSV data into the appropriate database table.
        
        Args:
            file: The uploaded CSV file
            category: The detected category (sleep/diet/exercise)
            session: Database session
            user_id: ID of the authenticated user who owns these entries
            
        Returns:
            dict with ingestion results (count, errors, etc.)
        """
        model_class = self.MODEL_MAP.get(category)
        if not model_class:
            raise ValueError(f"Unknown category: {category}")
        
        await file.seek(0)
        content = await file.read()
        decoded = content.decode("utf-8").splitlines()
        
        reader = csv.DictReader(decoded)
        
        inserted_count = 0
        errors = []
            
        for row_num, row in enumerate(reader, start=2):
            try:
                cleaned_row = {k.strip().lower(): v.strip() for k, v in row.items()}
                entry = self._row_to_model(cleaned_row, category, user_id)
                session.add(entry)
                inserted_count += 1
                
            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
        
        if inserted_count > 0:
            session.commit()
        
        return {
            "inserted": inserted_count,
            "errors": errors,
            "success": len(errors) == 0
        }
    
    def _row_to_model(self, row: dict, category: str, user_id: int):
        """Convert a CSV row dictionary to a model instance."""
        if category == "sleep":
            return SleepEntry(
                user_id=user_id,
                date=datetime.strptime(row["date"], "%Y-%m-%d").date(),
                hours=float(row["hours"]),
                quality=row["quality"],
            )
        elif category == "diet":
            return DietEntry(
                user_id=user_id,
                date=datetime.strptime(row["date"], "%Y-%m-%d").date(),
                calories=float(row["calories"]),
                protein_g=float(row["protein_g"]),
                carbs_g=float(row["carbs_g"]),
                fat_g=float(row["fat_g"]),
            )
        elif category == "exercise":
            return ExerciseEntry(
                user_id=user_id,
                date=datetime.strptime(row["date"], "%Y-%m-%d").date(),
                steps=int(row["steps"]),
                duration_min=float(row["duration_min"]),
                calories_burned=float(row["calories_burned"]),
            )
        else:
            raise ValueError(f"Unknown category: {category}")