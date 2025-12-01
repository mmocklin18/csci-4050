from fastapi import FastAPI
from app.routers.health import router as health_router
from app.routers.movies import router as movie_router
from app.routers.auth import router as auth_router
from app.routers.user import router as user_router
from app.routers.card import router as card_router
from app.routers.email import router as email_router
from app.routers.booking import router as booking_router
from app.routers.showroom import router as showroom_router
from app.routers.show import router as show_router
from app.routers.seat import router as seat_router
from app.routers.promotions import router as promotions_router
from app.routers.price import router as price_router
from app.routers.orders import router as orders_router
from app.routers.orders import router as orders_router


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
app.include_router(showroom_router)
app.include_router(show_router)
app.include_router(seat_router)
app.include_router(booking_router)
app.include_router(promotions_router)
app.include_router(price_router)
app.include_router(orders_router)
app.include_router(orders_router)




@app.get("/")
def root():
    return {"message": "Cinema Booking API running!"}
