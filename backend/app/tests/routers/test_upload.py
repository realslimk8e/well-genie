from io import BytesIO
from fastapi.testclient import TestClient
from sqlmodel import Session, select
from app.models import SleepEntry, DietEntry, ExerciseEntry


class TestUploadValidFiles:
    """Test POST /upload with valid CSV files"""
    
    def test_upload_valid_sleep_csv(self, client: TestClient, valid_sleep_csv, session: Session):
        """Verify successful upload of valid sleep.csv"""
        files = {"file": ("sleep.csv", valid_sleep_csv, "text/csv")}
        response = client.post("/upload", files=files)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["message"] == "Upload successful"
        assert data["filename"] == "sleep.csv"
        assert data["category"] == "sleep"
        assert data["inserted"] == 3
        assert data["errors"] is None or len(data["errors"]) == 0
        
        # Verify data was inserted into database
        sleep_entries = session.exec(select(SleepEntry)).all()
        assert len(sleep_entries) == 3
    
    def test_upload_valid_diet_csv(self, client: TestClient, valid_diet_csv, session: Session):
        """Verify successful upload of valid diet.csv"""
        files = {"file": ("diet.csv", valid_diet_csv, "text/csv")}
        response = client.post("/upload", files=files)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["message"] == "Upload successful"
        assert data["filename"] == "diet.csv"
        assert data["category"] == "diet"
        assert data["inserted"] == 3
        assert data["errors"] is None or len(data["errors"]) == 0
        
        # Verify data was inserted into database
        diet_entries = session.exec(select(DietEntry)).all()
        assert len(diet_entries) == 3
    
    def test_upload_valid_exercise_csv(self, client: TestClient, valid_exercise_csv, session: Session):
        """Verify successful upload of valid exercise.csv"""
        files = {"file": ("exercise.csv", valid_exercise_csv, "text/csv")}
        response = client.post("/upload", files=files)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["message"] == "Upload successful"
        assert data["filename"] == "exercise.csv"
        assert data["category"] == "exercise"
        assert data["inserted"] == 3
        assert data["errors"] is None or len(data["errors"]) == 0
        
        # Verify data was inserted into database
        exercise_entries = session.exec(select(ExerciseEntry)).all()
        assert len(exercise_entries) == 3


class TestUploadInvalidFiles:
    """Test POST /upload with invalid CSV files"""
    
    def test_upload_csv_with_missing_columns(self, client: TestClient, invalid_csv_missing_columns):
        """Verify rejection of CSV with missing required columns"""
        files = {"file": ("sleep.csv", invalid_csv_missing_columns, "text/csv")}
        response = client.post("/upload", files=files)
        
        assert response.status_code == 400
        data = response.json()
        
        assert "detail" in data
        assert "errors" in data["detail"]
        assert len(data["detail"]["errors"]) > 0
    
    def test_upload_csv_with_wrong_data_types(self, client: TestClient, invalid_csv_wrong_data_types):
        """Verify rejection of CSV with invalid data types"""
        files = {"file": ("sleep.csv", invalid_csv_wrong_data_types, "text/csv")}
        response = client.post("/upload", files=files)
        
        assert response.status_code == 400
        data = response.json()
        
        assert "detail" in data
        assert "errors" in data["detail"]
    
    def test_upload_empty_csv(self, client: TestClient, empty_csv):
        """Verify rejection of empty CSV file"""
        files = {"file": ("sleep.csv", empty_csv, "text/csv")}
        response = client.post("/upload", files=files)
        
        assert response.status_code == 400
        data = response.json()
        
        assert "detail" in data
    
    def test_upload_csv_with_headers_only(self, client: TestClient, csv_with_headers_only):
        """Verify rejection of CSV with only headers and no data"""
        files = {"file": ("sleep.csv", csv_with_headers_only, "text/csv")}
        response = client.post("/upload", files=files)
        
        assert response.status_code == 400
        data = response.json()
        
        assert "detail" in data


class TestUploadWrongFileType:
    """Test POST /upload with non-CSV files"""
    
    def test_upload_txt_file(self, client: TestClient):
        """Verify rejection of .txt file"""
        txt_content = BytesIO(b"This is a text file, not a CSV")
        files = {"file": ("document.txt", txt_content, "text/plain")}
        response = client.post("/upload", files=files)
        
        assert response.status_code == 400
    
    def test_upload_json_file(self, client: TestClient):
        """Verify rejection of .json file"""
        json_content = BytesIO(b'{"data": "value"}')
        files = {"file": ("data.json", json_content, "application/json")}
        response = client.post("/upload", files=files)
        
        assert response.status_code == 400


class TestUploadUnrecognizedHeaders:
    """Test POST /upload with unrecognized CSV filenames"""
    
    def test_upload_csv_with_unrecognized_headers(self, client: TestClient, valid_sleep_csv):
        """Verify rejection of CSV with headers that don't match any category"""
        csv_content = BytesIO(b"""name,age,city
                                John,30,NYC
                                Jane,25,LA""")
        files = {"file": ("unknown.csv", csv_content, "text/csv")}
        response = client.post("/upload", files=files)
        
        assert response.status_code == 400


class TestUploadDataIntegrity:
    """Test data integrity after upload"""
    
    def test_uploaded_data_matches_csv_content(self, client: TestClient, session: Session):
        """Verify uploaded data matches CSV content exactly"""
        csv_content = BytesIO(b"""date,hours,quality
                            2024-01-15,7.5,good
                            2024-01-16,8.5,excellent""")
        
        files = {"file": ("sleep.csv", csv_content, "text/csv")}
        response = client.post("/upload", files=files)
        
        assert response.status_code == 200
        
        # Verify data in database
        sleep_entries = session.exec(select(SleepEntry)).all()
        assert len(sleep_entries) == 2
        
        # Check first entry
        entry1 = next(e for e in sleep_entries if str(e.date) == "2024-01-15")
        assert entry1.hours == 7.5
        assert entry1.quality == "good"
        
        # Check second entry
        entry2 = next(e for e in sleep_entries if str(e.date) == "2024-01-16")
        assert entry2.hours == 8.5
        assert entry2.quality == "excellent"
    
    def test_multiple_uploads_accumulate_data(self, client: TestClient, session: Session):
        """Verify multiple uploads add data rather than replace it"""
        # First upload
        csv1 = BytesIO(b"""date,hours,quality
                2024-01-01,7.0,good""")
        files1 = {"file": ("sleep.csv", csv1, "text/csv")}
        response1 = client.post("/upload", files=files1)
        assert response1.status_code == 200
        
        # Second upload
        csv2 = BytesIO(b"""date,hours,quality
                2024-01-02,8.0,excellent""")
        files2 = {"file": ("sleep.csv", csv2, "text/csv")}
        response2 = client.post("/upload", files=files2)
        assert response2.status_code == 200
        
        # Verify both entries exist
        sleep_entries = session.exec(select(SleepEntry)).all()
        assert len(sleep_entries) == 2


class TestUploadNoFile:
    """Test POST /upload without providing a file"""
    
    def test_upload_without_file(self, client: TestClient):
        """Verify proper error when no file is provided"""
        response = client.post("/upload")
        
        # FastAPI returns 422 for missing required field
        assert response.status_code == 422