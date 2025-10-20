from fastapi.testclient import TestClient


class TestGetSleepEntriesNoFilters:
    """Test GET /api/sleep without any filters"""
    
    def test_returns_200_status(self, client: TestClient, sleep_entries):
        """Verify endpoint returns 200 OK status"""
        response = client.get("/api/sleep")
        assert response.status_code == 200
    
    def test_returns_all_entries(self, client: TestClient, sleep_entries):
        """Verify endpoint returns all sleep entries from database"""
        response = client.get("/api/sleep")
        data = response.json()
        
        assert "items" in data
        assert len(data["items"]) == len(sleep_entries)
        
        # Verify all entries are present
        returned_dates = {entry["date"] for entry in data["items"]}
        expected_dates = {str(entry.date) for entry in sleep_entries}
        assert returned_dates == expected_dates
    
    def test_returns_empty_list_when_no_data(self, client: TestClient):
        """Verify endpoint returns empty list when database is empty"""
        response = client.get("/api/sleep")
        data = response.json()
        
        assert response.status_code == 200
        assert data["items"] == []


class TestGetSleepEntriesWithStartDate:
    """Test GET /api/sleep with start_date filter"""
    
    def test_filters_by_start_date(self, client: TestClient, sleep_entries):
        """Verify only entries on or after start_date are returned"""
        response = client.get("/api/sleep?start_date=2024-01-03")
        data = response.json()
        
        assert response.status_code == 200
        assert len(data["items"]) == 5
        
        returned_dates = [entry["date"] for entry in data["items"]]
        assert "2024-01-01" not in returned_dates
        assert "2024-01-02" not in returned_dates
        for date_str in ["2024-01-03", "2024-01-04", "2024-01-05", "2024-01-06", "2024-01-07"]:
            assert date_str in returned_dates


class TestGetSleepEntriesWithEndDate:
    """Test GET /api/sleep with end_date filter"""
    
    def test_filters_by_end_date(self, client: TestClient, sleep_entries):
        """Verify only entries on or before end_date are returned"""
        response = client.get("/api/sleep?end_date=2024-01-04")
        data = response.json()
        
        assert response.status_code == 200
        assert len(data["items"]) == 4
        
        returned_dates = [entry["date"] for entry in data["items"]]
        for date_str in ["2024-01-01", "2024-01-02", "2024-01-03", "2024-01-04"]:
            assert date_str in returned_dates
        for date_str in ["2024-01-05", "2024-01-06", "2024-01-07"]:
            assert date_str not in returned_dates


class TestGetSleepEntriesWithDateRange:
    """Test GET /api/sleep with both start_date and end_date filters"""
    
    def test_filters_by_date_range(self, client: TestClient, sleep_entries):
        """Verify only entries within date range are returned"""
        response = client.get("/api/sleep?start_date=2024-01-03&end_date=2024-01-05")
        data = response.json()
        
        assert response.status_code == 200
        assert len(data["items"]) == 3
        
        returned_dates = [entry["date"] for entry in data["items"]]
        for date_str in ["2024-01-03", "2024-01-04", "2024-01-05"]:
            assert date_str in returned_dates
        for date_str in ["2024-01-01", "2024-01-02", "2024-01-06", "2024-01-07"]:
            assert date_str not in returned_dates


class TestGetSleepEntriesWithMinHours:
    """Test GET /api/sleep with min_hours filter"""
    
    def test_filters_by_min_hours(self, client: TestClient, sleep_entries):
        """Verify only entries with hours >= min_hours are returned"""
        response = client.get("/api/sleep?min_hours=8")
        data = response.json()
        
        assert response.status_code == 200
        assert len(data["items"]) == 4
        
        # Verify all returned entries have hours >= 8
        for entry in data["items"]:
            assert entry["hours"] >= 8.0


class TestGetSleepEntriesWithMaxHours:
    """Test GET /api/sleep with max_hours filter"""
    
    def test_filters_by_max_hours(self, client: TestClient, sleep_entries):
        """Verify only entries with hours <= max_hours are returned"""
        response = client.get("/api/sleep?max_hours=7.5")
        data = response.json()
        
        assert response.status_code == 200
        assert len(data["items"]) == 3
        
        # Verify all returned entries have hours <= 7.5
        for entry in data["items"]:
            assert entry["hours"] <= 7.5


class TestGetSleepEntriesWithHoursRange:
    """Test GET /api/sleep with both min_hours and max_hours filters"""
    
    def test_filters_by_hours_range(self, client: TestClient, sleep_entries):
        """Verify only entries within hours range are returned"""
        response = client.get("/api/sleep?min_hours=7&max_hours=8.5")
        data = response.json()
        
        assert response.status_code == 200
        assert len(data["items"]) == 4
        
        # Verify all returned entries are within range
        for entry in data["items"]:
            assert 7.0 <= entry["hours"] <= 8.5


class TestGetSleepEntriesWithQuality:
    """Test GET /api/sleep with quality filter"""
    
    def test_filters_by_quality(self, client: TestClient, sleep_entries):
        """Verify only entries matching quality are returned"""
        response = client.get("/api/sleep?quality=excellent")
        data = response.json()
        
        assert response.status_code == 200
        assert len(data["items"]) == 3
        
        # Verify all returned entries have quality "excellent"
        for entry in data["items"]:
            assert entry["quality"] == "excellent"


class TestGetSleepEntriesWithMultipleFilters:
    """Test GET /api/sleep with multiple filters combined"""
    
    def test_combines_multiple_filters(self, client: TestClient, sleep_entries):
        """Verify multiple filters work together correctly"""
        response = client.get(
            "/api/sleep?start_date=2024-01-03&end_date=2024-01-05&min_hours=8&quality=excellent"
        )
        data = response.json()
        
        assert response.status_code == 200
        assert len(data["items"]) == 2
        
        # Verify all filters are applied
        for entry in data["items"]:
            assert entry["date"] >= "2024-01-03"
            assert entry["date"] <= "2024-01-05"
            assert entry["hours"] >= 8.0
            assert entry["quality"] == "excellent"