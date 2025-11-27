# WellGenie

WellGenie is a web-based health companion app with a chatbot that consolidates scattered wellness data into clear, actionable insights. Built with a React frontend and a Python FastAPI backend, the system makes health tracking simple, engaging, and secure for students and young adults.

**Team Members**  
- Katherine Bauchman  
- Katherine Arnaud  
- Quinn Nguyen  

## 🚀 Getting Started
This project uses Docker to streamline setup and ensure a consistent development environment.

### Installation and Setup
1.  **Prerequisites**: Ensure you have [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed on your system.

2.  **Clone the repository**:
   ```bash
   git clone https://github.com/realslimk8e/well-genie.git
   cd well-genie
   ```

3.  **Build and run the application**:
   Use Docker Compose to build the images and start the containers for the frontend and backend services.
   ```bash
   docker-compose up --build
   ```

## Usage
Once the containers are running, you can access the application:

-   **Frontend**: Open your web browser and navigate to `http://localhost:3000`.
-   **Backend API**: The API is accessible at `http://localhost:8000`.

To log in to the application, use the default credentials:
-   **Username**: `admin`
-   **Password**: `123`
