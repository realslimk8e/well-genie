# WellGenie Frontend

This is the frontend for WellGenie, built with React, TypeScript, and Vite.

## 🚀 Getting Started

### With Docker (Recommended)
The frontend service is managed by the `docker-compose.yml` file in the root directory.

1.  Navigate to the project's root directory.
2.  Run the following command to build and start all services:
    ```bash
    docker-compose up --build
    ```
The application will be available at `http://localhost:3000`.

### Local Development (Without Docker)
1.  **Prerequisites**: Ensure you have Node.js and npm installed.

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or another port if 5173 is busy).

## Usage
After starting the application, open your browser to `http://localhost:3000` (for Docker) or the URL provided by the dev server. Log in with the credentials mentioned in the main `README.md` to begin using the app.