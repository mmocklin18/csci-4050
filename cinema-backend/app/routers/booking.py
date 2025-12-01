from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError

from app.core.db import get_session
from app.models.reserved_seats import ReservedSeat
from app.models.show import Show
from app.models.seats import Seat
from app.models.showroom import Showroom
from app.models.movie import Movie
from app.models.user import User
from app.models.booking import Booking

from app.schemas.booking import OrderConfirmationRequest
from app.schemas.reserved_seats import ReservedSeatCreate, ReservedSeatRead
from app.services.email_notifications import queue_order_confirmation_email


router = APIRouter(prefix="/booking", tags=["Booking"])


@router.post("/reserve", response_model=ReservedSeatRead)
async def reserve_seat(payload: ReservedSeatCreate, db: AsyncSession = Depends(get_session)):
    new_reservation = ReservedSeat(**payload.model_dump())
    db.add(new_reservation)
    try:
        await db.commit()
        await db.refresh(new_reservation)
        return new_reservation
    except IntegrityError:
        await db.rollback()
        raise HTTPException(400, "Seat already reserved for this show")


@router.post("/confirm-email", status_code=status.HTTP_202_ACCEPTED)
async def send_order_confirmation(
    payload: OrderConfirmationRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_session),
):
    user = await db.get(User, payload.user_id)
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")

    show = await db.get(Show, payload.show_id)
    if not show:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Showtime not found")

    seats_result = await db.execute(
        select(Seat).where(Seat.seats_id.in_(payload.seat_ids))
    )
    seats = seats_result.scalars().all()

    found_ids = {seat.seats_id for seat in seats}
    missing = [seat_id for seat_id in payload.seat_ids if seat_id not in found_ids]
    if missing:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Seat(s) not found: {missing}")

    invalid = [seat.seats_id for seat in seats if seat.showroom_id != show.showroom_id]
    if invalid:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "One or more seats do not belong to the selected show",
        )

    # Create booking record
    booking = Booking(
        user_id=payload.user_id,
        show_id=payload.show_id,
        total_amount=payload.total_amount,
    )
    db.add(booking)
    await db.flush()

    # Link existing reservations (created via /booking/reserve) to this booking,
    # or create them if they weren't created yet.
    existing_result = await db.execute(
        select(ReservedSeat).where(
            ReservedSeat.show_id == payload.show_id,
            ReservedSeat.seat_id.in_(payload.seat_ids),
        )
    )
    existing = {rs.seat_id: rs for rs in existing_result.scalars().all()}

    for seat in seats:
        current = existing.get(seat.seats_id)
        if current:
            if current.user_id != payload.user_id:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST,
                    f"Seat {seat.row_no}{seat.seat_no} is reserved by another user",
                )
            current.booking_id = booking.booking_id
        else:
            reserved = ReservedSeat(
                booking_id=booking.booking_id,
                user_id=payload.user_id,
                show_id=payload.show_id,
                seat_id=seat.seats_id,
            )
            db.add(reserved)

    await db.commit()
    await db.refresh(booking)

    movie = await db.get(Movie, show.movieid)
    showroom = await db.get(Showroom, show.showroom_id)
    seat_labels = sorted(f"{seat.row_no}{seat.seat_no}" for seat in seats)

    queue_order_confirmation_email(
        background_tasks,
        email=user.email,
        first_name=user.first_name,
        movie_title=movie.name if movie else "Your movie",
        show_time=show.date_time,
        showroom_name=showroom.name if showroom else None,
        seats=seat_labels,
        total_amount=payload.total_amount,
    )

    return {"message": "Order confirmation email queued"}
