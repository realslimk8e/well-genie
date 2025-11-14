from fastapi.testclient import TestClient


class TestGetExerciseEntriesNoFilters:
    """Test GET /api/exercise without any filters"""
    
    def test_returns_200_status(self, client: TestClient, exercise_entries):
        """Verify endpoint returns 200 OK status"""
        response = client.get("/api/exercise")
        assert response.status_code == 200
    
    def test_returns_all_entries(self, client: TestClient, exercise_entries):
        """Verify endpoint returns all exercise entries from database"""
        response = client.get("/api/exercise")
        data = response.json()
        
        assert "items" in data
        assert len(data["items"]) == len(exercise_entries)
        
        # Verify all entries are present
        returned_dates = {entry["date"] for entry in data["items"]}
        expected_dates = {str(entry.date) for entry in exercise_entries}
        assert returned_dates == expected_dates
    
    def test_returns_empty_list_when_no_data(self, client: TestClient):
        """Verify endpoint returns empty list when database is empty"""
        response = client.get("/api/exercise")
        data = response.json()
        
        assert response.status_code == 200
        assert data["items"] == []


class TestGetExerciseEntriesWithStartDate:
    """Test GET /api/exercise with start_date filter"""
    
    def test_filters_by_start_date(self, client: TestClient, exercise_entries):
        """Verify only entries on or after start_date are returned"""
        response = client.get("/api/exercise?start_date=2024-01-03")
        data = response.json()
        
        assert response.status_code == 200
        assert len(data["items"]) == 5
        
        returned_dates = [entry["date"] for entry in data["items"]]
        assert "2024-01-01" not in returned_dates
        assert "2024-01-02" not in returned_dates
        for date_str in ["2024-01-03", "2024-01-04", "2024-01-05", "2024-01-06", "2024-01-07"]:
            assert date_str in returned_dates


class TestGetExerciseEntriesWithEndDate:
    """Test GET /api/exercise with end_date filter"""
    
    def test_filters_by_end_date(self, client: TestClient, exercise_entries):
        """Verify only entries on or before end_date are returned"""
        response = client.get("/api/exercise?end_date=2024-01-04")
        data = response.json()
        
        assert response.status_code == 200
        assert len(data["items"]) == 4
        
        returned_dates = [entry["date"] for entry in data["items"]]
        for date_str in ["2024-01-01", "2024-01-02", "2024-01-03", "2024-01-04"]:
            assert date_str in returned_dates
        for date_str in ["2024-01-05", "2024-01-06", "2024-01-07"]:
            assert date_str not in returned_dates


class TestGetExerciseEntriesWithDateRange:
    """Test GET /api/exercise with both start_date and end_date filters"""
    
    def test_filters_by_date_range(self, client: TestClient, exercise_entries):
        """Verify only entries within date range are returned"""
        response = client.get("/api/exercise?start_date=2024-01-03&end_date=2024-01-05")
        data = response.json()
        
        assert response.status_code == 200
        assert len(data["items"]) == 3
        
        returned_dates = [entry["date"] for entry in data["items"]]
        for date_str in ["2024-01-03", "2024-01-04", "2024-01-05"]:
            assert date_str in returned_dates
        for date_str in ["2024-01-01", "2024-01-02", "2024-01-06", "2024-01-07"]:
            assert date_str not in returned_dates


class TestGetExerciseEntriesWithMinSteps:
    """Test GET /api/exercise with min_steps filter"""
    
    def test_filters_by_min_steps(self, client: TestClient, exercise_entries):
        """Verify only entries with steps >= min_steps are returned"""
        response = client.get("/api/exercise?min_steps=8000")
        data = response.json()
        
        assert response.status_code == 200
        assert len(data["items"]) == 4  # 8000, 10000, 12000, 15000
        
        # Verify all returned entries have steps >= 8000
        for entry in data["items"]:
            assert entry["steps"] >= 8000


class TestGetExerciseEntriesWithMaxSteps:
    """Test GET /api/exercise with max_steps filter"""
    
    def test_filters_by_max_steps(self, client: TestClient, exercise_entries):
        """Verify only entries with steps <= max_steps are returned"""
        response = client.get("/api/exercise?max_steps=8000")
        data = response.json()
        
        assert response.status_code == 200
        assert len(data["items"]) == 4  # 3000, 5000, 6000, 8000
        
        # Verify all returned entries have steps <= 8000
        for entry in data["items"]:
            assert entry["steps"] <= 8000


class TestGetExerciseEntriesWithStepsRange:
    """Test GET /api/exercise with both min_steps and max_steps filters"""
    
    def test_filters_by_steps_range(self, client: TestClient, exercise_entries):
        """Verify only entries within steps range are returned"""
        response = client.get("/api/exercise?min_steps=6000&max_steps=10000")
        data = response.json()
        
        assert response.status_code == 200
        assert len(data["items"]) == 3
        
        # Verify all returned entries are within range
        for entry in data["items"]:
            assert 6000 <= entry["steps"] <= 10000


class TestGetExerciseEntriesWithDurationMin:
    """Test GET /api/exercise with duration_min filter"""
    
    def test_filters_by_min_duration(self, client: TestClient, exercise_entries):
        """Verify only entries with duration >= duration_min are returned"""
        response = client.get("/api/exercise?duration_min=45")
        data = response.json()
        
        assert response.status_code == 200
        assert len(data["items"]) == 4  # 45, 60, 75, 90
        
        # Verify all returned entries have duration >= 45
        for entry in data["items"]:
            assert entry["duration_min"] >= 45


class TestGetExerciseEntriesWithMinCaloriesBurned:
    """Test GET /api/exercise with min_calories_burned filter"""
    
    def test_filters_by_min_calories_burned(self, client: TestClient, exercise_entries):
        """Verify only entries with calories_burned >= min_calories_burned are returned"""
        response = client.get("/api/exercise?min_calories_burned=400")
        data = response.json()
        
        assert response.status_code == 200
        assert len(data["items"]) == 4
        
        # Verify all returned entries have calories_burned >= 400
        for entry in data["items"]:
            assert entry["calories_burned"] >= 400


class TestGetExerciseEntriesWithMultipleFilters:
    """Test GET /api/exercise with multiple filters combined"""
    
    def test_combines_multiple_filters(self, client: TestClient, exercise_entries):
        """Verify multiple filters work together correctly"""
        response = client.get(
            "/api/exercise?start_date=2024-01-03&end_date=2024-01-06&min_steps=8000&duration_min=45&min_calories_burned=400"
        )
        data = response.json()
        
        assert response.status_code == 200
        assert len(data["items"]) == 3
        
        # Verify all filters are applied
        for entry in data["items"]:
            assert entry["date"] >= "2024-01-03"
            assert entry["date"] <= "2024-01-06"
            assert entry["steps"] >= 8000
            assert entry["duration_min"] >= 45
            assert entry["calories_burned"] >= 400