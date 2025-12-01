from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.db import get_session
from app.core.dependencies import get_current_user
from app.models.booking import Booking
from app.models.show import Show
from app.models.movie import Movie
from app.models.showroom import Showroom
from app.models.seats import Seat
from app.schemas.booking import BookingRead

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.get("/history", response_model=list[BookingRead])
async def get_order_history(
    db: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user)
):
    result = await db.execute(
        select(Booking)
        .where(Booking.user_id == current_user.user_id)
        .options(selectinload(Booking.reserved_seats))
    )
    bookings = result.scalars().all()
    if not bookings:
        return []

    show_ids = {b.show_id for b in bookings}
    seat_ids = {rs.seat_id for b in bookings for rs in b.reserved_seats}

    shows = (await db.execute(select(Show).where(Show.show_id.in_(show_ids)))).scalars().all()
    shows_map = {s.show_id: s for s in shows}

    movie_ids = {s.movieid for s in shows}
    movies = (await db.execute(select(Movie).where(Movie.movie_id.in_(movie_ids)))).scalars().all()
    movies_map = {m.movie_id: m for m in movies}

    showroom_ids = {s.showroom_id for s in shows}
    showrooms = (await db.execute(select(Showroom).where(Showroom.showroom_id.in_(showroom_ids)))).scalars().all()
    showrooms_map = {sr.showroom_id: sr for sr in showrooms}

    seats = (await db.execute(select(Seat).where(Seat.seats_id.in_(seat_ids)))).scalars().all()
    seats_map = {s.seats_id: s for s in seats}

    enriched: list[BookingRead] = []
    for b in bookings:
        show = shows_map.get(b.show_id)
        movie = movies_map.get(show.movieid) if show else None
        showroom = showrooms_map.get(show.showroom_id) if show else None
        seat_labels = []
        for rs in b.reserved_seats:
            seat = seats_map.get(rs.seat_id)
            if seat:
                seat_labels.append(f"{seat.row_no}{seat.seat_no}")

        data = BookingRead.model_validate(
            b,
            from_attributes=True,
        )
        data.movie_name = movie.name if movie else None
        data.showroom = showroom.name if showroom else None
        data.seat_labels = seat_labels
        enriched.append(data)

    return enriched
