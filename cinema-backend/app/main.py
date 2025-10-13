from fastapi import FastAPI
from app.routers.health import router as health_router
from app.routers.movies import router as movie_router


app = FastAPI()

# Include routers with /api prefix
app.include_router(health_router, prefix="/api")
app.include_router(movie_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Cinema Booking API running!"}