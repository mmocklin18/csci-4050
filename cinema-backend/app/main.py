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
app.include_router(movie_router)
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(card_router)
app.include_router(email_router)
app.include_router(showroom_router)
app.include_router(show_router)
app.include_router(seat_router)
app.include_router(booking_router)
app.include_router(promotions_router)
app.include_router(price_router)



@app.get("/")
def root():
    return {"message": "Cinema Booking API running!"}
