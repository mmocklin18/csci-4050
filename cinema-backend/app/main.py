from fastapi import FastAPI
from app.routers.health import router as health_router
from app.routers.movies import router as movie_router
from app.routers.auth import router as auth_router
from app.routers.user import router as user_router
from app.routers.card import router as card_router
from app.routers.email import router as email_router
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(movie_router)
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(card_router)
app.include_router(email_router)


@app.get("/")
def root():
    return {"message": "Cinema Booking API running!"}
