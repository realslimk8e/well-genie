import pytest
from io import BytesIO
from datetime import date
from fastapi import UploadFile
from sqlmodel import Session, select
from app.services.ingest import IngestService
from app.models import SleepEntry, DietEntry, ExerciseEntry


class TestIngestServiceSleep:
    """Test ingestion of sleep data"""
    
    @pytest.mark.asyncio
    async def test_ingests_valid_sleep_data(self, session: Session):
        """Verify valid sleep data is ingested correctly"""
        ingest_service = IngestService()
        csv_content = BytesIO(b"""date,hours,quality
2024-01-01,7.5,good
2024-01-02,8.0,excellent""")
        file = UploadFile(filename="sleep.csv", file=csv_content)
        
        result = await ingest_service.ingest_csv(file, "sleep", session)
        
        assert result["inserted"] == 2
        assert result["success"] is True
        assert len(result["errors"]) == 0
        
        # Verify data in database
        entries = session.exec(select(SleepEntry)).all()
        assert len(entries) == 2
        assert entries[0].hours == 7.5
        assert entries[0].quality == "good"
    
    @pytest.mark.asyncio
    async def test_handles_partial_failure_in_sleep_data(self, session: Session):
        """Verify partial failures are handled correctly"""
        ingest_service = IngestService()
        csv_content = BytesIO(b"""date,hours,quality
2024-01-01,7.5,good
2024-01-02,invalid,excellent
2024-01-03,8.0,fair""")
        file = UploadFile(filename="sleep.csv", file=csv_content)
        
        result = await ingest_service.ingest_csv(file, "sleep", session)
        
        # Should insert valid rows and report errors for invalid ones
        assert result["inserted"] == 2  # Rows 1 and 3
        assert len(result["errors"]) == 1  # Row 2
        assert "Row 3" in result["errors"][0]  # Row 3 in CSV (line 3)


class TestIngestServiceDiet:
    """Test ingestion of diet data"""
    
    @pytest.mark.asyncio
    async def test_ingests_valid_diet_data(self, session: Session):
        """Verify valid diet data is ingested correctly"""
        ingest_service = IngestService()
        csv_content = BytesIO(b"""date,calories,protein_g,carbs_g,fat_g
2024-01-01,2000.0,100.0,250.0,70.0
2024-01-02,2200.0,110.0,260.0,75.0""")
        file = UploadFile(filename="diet.csv", file=csv_content)
        
        result = await ingest_service.ingest_csv(file, "diet", session)
        
        assert result["inserted"] == 2
        assert result["success"] is True
        assert len(result["errors"]) == 0
        
        # Verify data in database
        entries = session.exec(select(DietEntry)).all()
        assert len(entries) == 2
        assert entries[0].calories == 2000.0
        assert entries[0].protein_g == 100.0
        assert entries[0].date == date(2024, 1, 1)


class TestIngestServiceExercise:
    """Test ingestion of exercise data"""
    
    @pytest.mark.asyncio
    async def test_ingests_valid_exercise_data(self, session: Session):
        """Verify valid exercise data is ingested correctly"""
        ingest_service = IngestService()
        csv_content = BytesIO(b"""date,steps,duration_min,calories_burned
2024-01-01,10000,60.0,500.0
2024-01-02,12000,75.0,600.0""")
        file = UploadFile(filename="exercise.csv", file=csv_content)
        
        result = await ingest_service.ingest_csv(file, "exercise", session)
        
        assert result["inserted"] == 2
        assert result["success"] is True
        assert len(result["errors"]) == 0
        
        # Verify data in database
        entries = session.exec(select(ExerciseEntry)).all()
        assert len(entries) == 2
        assert entries[0].steps == 10000
        assert entries[0].duration_min == 60.0
        assert entries[0].date == date(2024, 1, 1)


class TestIngestServiceDataCleaning:
    """Test data cleaning and whitespace handling"""
    
    @pytest.mark.asyncio
    async def test_strips_whitespace_from_values(self, session: Session):
        """Verify whitespace is stripped from values"""
        ingest_service = IngestService()
        csv_content = BytesIO(b"""date,hours,quality
2024-01-01,  7.5  ,  good  """)
        file = UploadFile(filename="sleep.csv", file=csv_content)
        
        result = await ingest_service.ingest_csv(file, "sleep", session)
        
        assert result["inserted"] == 1
        
        # Verify data is cleaned
        entries = session.exec(select(SleepEntry)).all()
        assert entries[0].hours == 7.5
        assert entries[0].quality == "good"  # No extra spaces
    
    @pytest.mark.asyncio
    async def test_handles_mixed_case_headers(self, session: Session):
        """Verify mixed case headers are handled"""
        ingest_service = IngestService()
        csv_content = BytesIO(b"""Date,Hours,Quality
2024-01-01,7.5,good""")
        file = UploadFile(filename="sleep.csv", file=csv_content)
        
        result = await ingest_service.ingest_csv(file, "sleep", session)
        
        assert result["inserted"] == 1


class TestIngestServiceErrorHandling:
    """Test error handling in ingestion"""
    
    @pytest.mark.asyncio
    async def test_handles_invalid_category(self, session: Session):
        """Verify unknown category raises error"""
        ingest_service = IngestService()
        csv_content = BytesIO(b"date,value\n2024-01-01,123")
        file = UploadFile(filename="unknown.csv", file=csv_content)
        
        with pytest.raises(ValueError, match="Unknown category"):
            await ingest_service.ingest_csv(file, "unknown", session)
    
    @pytest.mark.asyncio
    async def test_reports_row_number_in_errors(self, session: Session):
        """Verify error messages include row numbers"""
        ingest_service = IngestService()
        csv_content = BytesIO(b"""date,hours,quality
2024-01-01,7.5,good
invalid-date,8.0,excellent""")
        file = UploadFile(filename="sleep.csv", file=csv_content)
        
        result = await ingest_service.ingest_csv(file, "sleep", session)
        
        assert len(result["errors"]) == 1
        assert "Row 3" in result["errors"][0]  # Row 3 in the file (header is row 1)
    
    @pytest.mark.asyncio
    async def test_commits_only_valid_rows(self, session: Session):
        """Verify only valid rows are committed to database"""
        ingest_service = IngestService()
        csv_content = BytesIO(b"""date,hours,quality
2024-01-01,7.5,good
invalid-date,8.0,excellent
2024-01-03,6.5,poor""")
        file = UploadFile(filename="sleep.csv", file=csv_content)
        
        result = await ingest_service.ingest_csv(file, "sleep", session)
        
        # Should insert 2 valid rows
        assert result["inserted"] == 2
        
        # Verify only valid data is in database
        entries = session.exec(select(SleepEntry)).all()
        assert len(entries) == 2
        dates = [entry.date for entry in entries]
        assert date(2024, 1, 1) in dates
        assert date(2024, 1, 3) in dates


class TestIngestServiceDateParsing:
    """Test date parsing"""
    
    @pytest.mark.asyncio
    async def test_parses_valid_date_format(self, session: Session):
        """Verify YYYY-MM-DD dates are parsed correctly"""
        ingest_service = IngestService()
        csv_content = BytesIO(b"""date,hours,quality
2024-01-15,7.5,good""")
        file = UploadFile(filename="sleep.csv", file=csv_content)
        
        result = await ingest_service.ingest_csv(file, "sleep", session)
        
        assert result["inserted"] == 1
        
        entries = session.exec(select(SleepEntry)).all()
        assert entries[0].date == date(2024, 1, 15)
    
    @pytest.mark.asyncio
    async def test_rejects_invalid_date_format(self, session: Session):
        """Verify invalid date formats cause errors"""
        ingest_service = IngestService()
        csv_content = BytesIO(b"""date,hours,quality
01/15/2024,7.5,good""")
        file = UploadFile(filename="sleep.csv", file=csv_content)
        
        result = await ingest_service.ingest_csv(file, "sleep", session)
        
        assert result["inserted"] == 0
        assert len(result["errors"]) == 1
        assert "Row 2" in result["errors"][0]


class TestIngestServiceEmptyFile:
    """Test handling of empty data"""
    
    @pytest.mark.asyncio
    async def test_handles_empty_csv_after_headers(self, session: Session):
        """Verify CSV with only headers doesn't cause errors"""
        ingest_service = IngestService()
        csv_content = BytesIO(b"date,hours,quality")
        file = UploadFile(filename="sleep.csv", file=csv_content)
        
        result = await ingest_service.ingest_csv(file, "sleep", session)
        
        assert result["inserted"] == 0
        assert len(result["errors"]) == 0
        assert result["success"] is True