from fastapi import FastAPI
from sqlmodel import SQLModel
from app.routers import sleep, diet, exercise, upload, auth
from contextlib import asynccontextmanager
from app.database import engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic:
    print("Application startup: Initializing resources...")
    SQLModel.metadata.create_all(engine)
    yield  # Application runs here
    # Shutdown logic:
    # print("Application shutdown: Cleaning up resources...")

app = FastAPI(
    title="WellGenie API",
    lifespan=lifespan
)

app.include_router(sleep.router, prefix="/api")
app.include_router(diet.router, prefix="/api")
app.include_router(exercise.router, prefix="/api")
app.include_router(upload.router)
app.include_router(auth.router)

# --- Routes
@app.get("/")
async def root():
    return {"message": "Welcome to WellGenie API"}