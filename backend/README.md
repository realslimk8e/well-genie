# WellGenie Backend

This directory contains the backend service for WellGenie, built with FastAPI and `uv` Package manager.

## 🚀 Getting Started

### With Docker (Recommended)
The backend service is managed by the `docker-compose.yml` file in the root directory.

1.  Navigate to the project's root directory.
2.  Run the following command to build and start all services:
    ```bash
    docker-compose up --build
    ```
The API will be available at `http://localhost:8000`.
The API docs will be available at `http://localhost:8000/docs`

### Local Development (Without Docker)
1.  **Prerequisites**: Ensure you have Python 3.12+ and uv installed.

2.  **Install dependencies**:
    ```bash
    uv sync
    ```

3.  **Run the development server**:
    ```bash
    uv run uvicorn app.main:app --reload
    ```