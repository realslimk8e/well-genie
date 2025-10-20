# Test validate_file with Valid CSVs:
# For each category (sleep, diet, exercise), create a mock UploadFile with the correct headers.
# Call validator.validate_file() and assert that validation["valid"] is True and the correct category is detected.

# Test validate_file with Invalid Headers:
# Create a mock UploadFile with headers that don't match any category.
# Assert that validation["valid"] is False and the errors list contains the expected message.

# Test validate_file with Invalid Extension:
# Create a mock UploadFile with a filename like data.txt.
# Assert that validation["valid"] is False.

import pytest
from io import BytesIO
from fastapi import UploadFile
from app.services.validators import DocumentValidator

class TestDocumentValidatorFileType:
    """Test file type validation"""
    
    @pytest.mark.asyncio
    async def test_accepts_csv_files(self):
        """Verify .csv files are accepted"""
        validator = DocumentValidator()
        csv_content = BytesIO(b"date,hours,quality\n2024-01-01,7.5,good")
        file = UploadFile(filename="test.csv", file=csv_content)
        
        result = await validator.validate_file(file)
        
        # Should not fail on extension check
        assert "Invalid file type" not in str(result.get("errors", []))
    
    @pytest.mark.asyncio
    async def test_rejects_non_csv_files(self):
        """Verify non-CSV files are rejected"""
        validator = DocumentValidator()
        txt_content = BytesIO(b"This is a text file")
        file = UploadFile(filename="test.txt", file=txt_content)
        
        result = await validator.validate_file(file)
        
        assert result["valid"] is False
        assert any("Invalid file type" in err for err in result["errors"])


class TestDocumentValidatorHeaders:
    """Test header validation"""
    
    @pytest.mark.asyncio
    async def test_recognizes_sleep_headers(self):
        """Verify sleep CSV headers are recognized"""
        validator = DocumentValidator()
        csv_content = BytesIO(b"date,hours,quality\n2024-01-01,7.5,good")
        file = UploadFile(filename="sleep.csv", file=csv_content)
        
        result = await validator.validate_file(file)
        
        assert result["valid"] is True
        assert result["category"] == "sleep"
    
    @pytest.mark.asyncio
    async def test_recognizes_diet_headers(self):
        """Verify diet CSV headers are recognized"""
        validator = DocumentValidator()
        csv_content = BytesIO(b"date,calories,protein_g,carbs_g,fat_g\n2024-01-01,2000,100,250,70")
        file = UploadFile(filename="diet.csv", file=csv_content)
        
        result = await validator.validate_file(file)
        
        assert result["valid"] is True
        assert result["category"] == "diet"
    
    @pytest.mark.asyncio
    async def test_recognizes_exercise_headers(self):
        """Verify exercise CSV headers are recognized"""
        validator = DocumentValidator()
        csv_content = BytesIO(b"date,steps,duration_min,calories_burned\n2024-01-01,10000,60,500")
        file = UploadFile(filename="exercise.csv", file=csv_content)
        
        result = await validator.validate_file(file)
        
        assert result["valid"] is True
        assert result["category"] == "exercise"
    
    @pytest.mark.asyncio
    async def test_rejects_unrecognized_headers(self):
        """Verify unrecognized headers are rejected"""
        validator = DocumentValidator()
        csv_content = BytesIO(b"name,age,city\nJohn,30,NYC")
        file = UploadFile(filename="unknown.csv", file=csv_content)
        
        result = await validator.validate_file(file)
        
        assert result["valid"] is False
        assert any("not match" in err.lower() for err in result["errors"])
    
    @pytest.mark.asyncio
    async def test_rejects_missing_required_column(self):
        """Verify missing required columns are rejected"""
        validator = DocumentValidator()
        csv_content = BytesIO(b"date,hours\n2024-01-01,7.5")
        file = UploadFile(filename="sleep.csv", file=csv_content)
        
        result = await validator.validate_file(file)
        
        assert result["valid"] is False


class TestDocumentValidatorEmptyFiles:
    """Test empty file validation"""
    
    @pytest.mark.asyncio
    async def test_rejects_empty_file(self):
        """Verify empty files are rejected"""
        validator = DocumentValidator()
        csv_content = BytesIO(b"")
        file = UploadFile(filename="sleep.csv", file=csv_content)
        
        result = await validator.validate_file(file)
        
        assert result["valid"] is False
        assert any("empty" in err.lower() for err in result["errors"])
    
    @pytest.mark.asyncio
    async def test_rejects_headers_only(self):
        """Verify files with only headers are rejected"""
        validator = DocumentValidator()
        csv_content = BytesIO(b"date,hours,quality")
        file = UploadFile(filename="sleep.csv", file=csv_content)
        
        result = await validator.validate_file(file)
        
        assert result["valid"] is False
        assert any("no data" in err.lower() or "only headers" in err.lower() for err in result["errors"])


class TestDocumentValidatorDataTypes:
    """Test data type validation"""
    
    @pytest.mark.asyncio
    async def test_rejects_invalid_number_for_hours(self):
        """Verify non-numeric hours values are rejected"""
        validator = DocumentValidator()
        csv_content = BytesIO(b"date,hours,quality\n2024-01-01,not_a_number,good")
        file = UploadFile(filename="sleep.csv", file=csv_content)
        
        result = await validator.validate_file(file)
        
        assert result["valid"] is False
        assert any("Invalid hours" in err for err in result["errors"])
    
    @pytest.mark.asyncio
    async def test_rejects_invalid_date_format(self):
        """Verify invalid date formats are rejected"""
        validator = DocumentValidator()
        csv_content = BytesIO(b"date,hours,quality\n01/01/2024,7.5,good")
        file = UploadFile(filename="sleep.csv", file=csv_content)
        
        result = await validator.validate_file(file)
        
        assert result["valid"] is False
        assert any("Invalid date format" in err for err in result["errors"])
    
    @pytest.mark.asyncio
    async def test_rejects_negative_hours(self):
        """Verify negative hours are rejected"""
        validator = DocumentValidator()
        csv_content = BytesIO(b"date,hours,quality\n2024-01-01,-5,good")
        file = UploadFile(filename="sleep.csv", file=csv_content)
        
        result = await validator.validate_file(file)
        
        assert result["valid"] is False
        assert any("cannot be negative" in err.lower() or "must be between" in err.lower() 
                  for err in result["errors"])
    
    @pytest.mark.asyncio
    async def test_rejects_hours_over_24(self):
        """Verify hours > 24 are rejected"""
        validator = DocumentValidator()
        csv_content = BytesIO(b"date,hours,quality\n2024-01-01,25,good")
        file = UploadFile(filename="sleep.csv", file=csv_content)
        
        result = await validator.validate_file(file)
        
        assert result["valid"] is False
        assert any("must be between" in err.lower() for err in result["errors"])


class TestDocumentValidatorMixedValidInvalid:
    """Test files with both valid and invalid rows"""
    
    @pytest.mark.asyncio
    async def test_reports_all_invalid_rows(self):
        """Verify all invalid rows are reported"""
        validator = DocumentValidator()
        csv_content = BytesIO(b"""date,hours,quality
2024-01-01,7.5,good
2024-01-02,invalid,good
2024-01-03,8.0,excellent
2024-01-04,-2,poor""")
        file = UploadFile(filename="sleep.csv", file=csv_content)
        
        result = await validator.validate_file(file)
        
        assert result["valid"] is False
        # Should report both row 3 (invalid) and row 5 (negative)
        assert len(result["errors"]) >= 2
        assert any("Row 3" in err for err in result["errors"])
        assert any("Row 5" in err for err in result["errors"])


class TestDocumentValidatorCaseInsensitivity:
    """Test that validator handles different case variations"""
    
    @pytest.mark.asyncio
    async def test_handles_uppercase_headers(self):
        """Verify uppercase headers are handled correctly"""
        validator = DocumentValidator()
        csv_content = BytesIO(b"DATE,HOURS,QUALITY\n2024-01-01,7.5,good")
        file = UploadFile(filename="sleep.csv", file=csv_content)
        
        result = await validator.validate_file(file)
        
        assert result["valid"] is True
        assert result["category"] == "sleep"
    
    @pytest.mark.asyncio
    async def test_handles_mixed_case_headers(self):
        """Verify mixed case headers are handled correctly"""
        validator = DocumentValidator()
        csv_content = BytesIO(b"Date,Hours,Quality\n2024-01-01,7.5,good")
        file = UploadFile(filename="sleep.csv", file=csv_content)
        
        result = await validator.validate_file(file)
        
        assert result["valid"] is True
        assert result["category"] == "sleep"