from fastapi import FastAPI
from app.routers.health import router as health_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api")

app.include_router(health_router)

@app.get("/")
def root():
    return {"message": "Cinema Booking API running!"}