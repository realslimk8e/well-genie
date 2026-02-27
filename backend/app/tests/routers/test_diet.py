from fastapi.testclient import TestClient


class TestGetDietEntriesNoFilters:
    """Test GET /api/diet without any filters"""
    
    def test_returns_200_status(self, client: TestClient, diet_entries):
        """Verify endpoint returns 200 OK status"""
        response = client.get("/api/diet")
        assert response.status_code == 200
    
    def test_returns_all_entries(self, client: TestClient, diet_entries):
        """Verify endpoint returns all diet entries from database"""
        response = client.get("/api/diet")
        data = response.json()
        
        assert "items" in data
        assert len(data["items"]) == len(diet_entries)
        
        # Verify all entries are present
        returned_dates = {entry["date"] for entry in data["items"]}
        expected_dates = {str(entry.date) for entry in diet_entries}
        assert returned_dates == expected_dates
    
    def test_returns_empty_list_when_no_data(self, client: TestClient):
        """Verify endpoint returns empty list when database is empty"""
        response = client.get("/api/diet")
        data = response.json()
        
        assert response.status_code == 200
        assert data["items"] == []


class TestGetDietEntriesWithStartDate:
    """Test GET /api/diet with start_date filter"""
    
    def test_filters_by_start_date(self, client: TestClient, diet_entries):
        """Verify only entries on or after start_date are returned"""
        response = client.get("/api/diet?start_date=2024-01-03")
        data = response.json()
        
        assert response.status_code == 200
        assert len(data["items"]) == 5
        
        returned_dates = [entry["date"] for entry in data["items"]]
        for date_str in ["2024-01-03", "2024-01-04", "2024-01-05", "2024-01-06", "2024-01-07"]:
            assert date_str in returned_dates


class TestGetDietEntriesWithEndDate:
    """Test GET /api/diet with end_date filter"""
    
    def test_filters_by_end_date(self, client: TestClient, diet_entries):
        """Verify only entries on or before end_date are returned"""
        response = client.get("/api/diet?end_date=2024-01-04")
        data = response.json()
        
        assert response.status_code == 200
        assert len(data["items"]) == 4
        
        returned_dates = [entry["date"] for entry in data["items"]]
        for date_str in ["2024-01-01", "2024-01-02", "2024-01-03", "2024-01-04"]:
            assert date_str in returned_dates


class TestGetDietEntriesWithDateRange:
    """Test GET /api/diet with both start_date and end_date filters"""
    
    def test_filters_by_date_range(self, client: TestClient, diet_entries):
        """Verify only entries within date range are returned"""
        response = client.get("/api/diet?start_date=2024-01-03&end_date=2024-01-05")
        data = response.json()
        
        assert response.status_code == 200
        assert len(data["items"]) == 3
        
        returned_dates = [entry["date"] for entry in data["items"]]
        for date_str in ["2024-01-03", "2024-01-04", "2024-01-05"]:
            assert date_str in returned_dates


class TestGetDietEntriesWithMinCalories:
    """Test GET /api/diet with min_calories filter"""
    
    def test_filters_by_min_calories(self, client: TestClient, diet_entries):
        """Verify only entries with calories >= min_calories are returned"""
        response = client.get("/api/diet?min_calories=2000")
        data = response.json()
        
        assert response.status_code == 200
        assert len(data["items"]) == 4
        
        for entry in data["items"]:
            assert entry["calories"] >= 2000


class TestGetDietEntriesWithMaxCalories:
    """Test GET /api/diet with max_calories filter"""
    
    def test_filters_by_max_calories(self, client: TestClient, diet_entries):
        """Verify only entries with calories <= max_calories are returned"""
        response = client.get("/api/diet?max_calories=1900")
        data = response.json()
        
        assert response.status_code == 200
        assert len(data["items"]) == 3
        
        for entry in data["items"]:
            assert entry["calories"] <= 1900


class TestGetDietEntriesWithCaloriesRange:
    """Test GET /api/diet with both min_calories and max_calories filters"""
    
    def test_filters_by_calories_range(self, client: TestClient, diet_entries):
        """Verify only entries within calories range are returned"""
        response = client.get("/api/diet?min_calories=1800&max_calories=2200")
        data = response.json()
        
        assert response.status_code == 200
        assert len(data["items"]) == 4
        
        for entry in data["items"]:
            assert 1800 <= entry["calories"] <= 2200


class TestGetDietEntriesWithMultipleFilters:
    """Test GET /api/diet with multiple filters combined"""
    
    def test_combines_multiple_filters(self, client: TestClient, diet_entries):
        """Verify multiple filters work together correctly"""
        response = client.get(
            "/api/diet?start_date=2024-01-04&end_date=2024-01-06&min_calories=2000&max_calories=2500"
        )
        data = response.json()
        
        assert response.status_code == 200
        assert len(data["items"]) == 3
        
        for entry in data["items"]:
            # These assertions are implicitly covered by the API logic and the length check,
            # but can be kept for explicit verification.
            assert "2024-01-04" <= entry["date"] <= "2024-01-06"
            assert 2000 <= entry["calories"] <= 2500


class TestDeleteDietEntries:
    """Test DELETE /api/diet"""

    def test_deletes_entries_in_date_range(self, client: TestClient, diet_entries):
        """
        Verify entries within the date range are deleted.
        """
        # Assuming diet_entries fixture creates 7 entries for dates 2024-01-01 to 2024-01-07
        response = client.delete("/api/diet?start_date=2024-01-03&end_date=2024-01-05")

        assert response.status_code == 200
        data = response.json()
        # Deleting 3 entries (Jan 3, 4, 5)
        assert data["message"] == "Successfully deleted 3 diet entries."

        # Verify that the entries are actually deleted by fetching again
        response = client.get("/api/diet")
        data = response.json()
        # 7 initial entries - 3 deleted = 4 remaining
        assert len(data["items"]) == 4

        returned_dates = {entry["date"] for entry in data["items"]}
        assert "2024-01-03" not in returned_dates
        assert "2024-01-04" not in returned_dates
        assert "2024-01-05" not in returned_dates
