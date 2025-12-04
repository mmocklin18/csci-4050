from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError

from app.core.db import get_session
from app.core.dependencies import get_current_user
from app.models.reserved_seats import ReservedSeat
from app.models.show import Show
from app.models.seats import Seat
from app.models.showroom import Showroom
from app.models.movie import Movie
from app.models.user import User
from app.models.booking import Booking

from app.schemas.booking import BookingRead, OrderConfirmationRequest
from app.schemas.reserved_seats import ReservedSeatCreate, ReservedSeatRead
from app.services.email_notifications import queue_order_confirmation_email


router = APIRouter(prefix="/booking", tags=["Booking"])


async def _create_booking_and_send_email(
    payload: OrderConfirmationRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession,
    current_user: User,
) -> Booking:
    if not payload.creditcard:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "A payment method is required to complete booking",
        )

    if payload.user_id != current_user.user_id:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Cannot create a booking for another user",
        )

    user = current_user

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

    existing_result = await db.execute(
        select(ReservedSeat).where(
            ReservedSeat.show_id == payload.show_id,
            ReservedSeat.seat_id.in_(payload.seat_ids),
        )
    )
    existing = existing_result.scalars().all()

    stolen = [
        f"{seat.row_no}{seat.seat_no}"
        for seat in seats
        for rs in existing
        if rs.seat_id == seat.seats_id and rs.user_id != current_user.user_id
    ]
    if stolen:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            f"Seat(s) already reserved by another user: {sorted(set(stolen))}",
        )

    booking = Booking(
        user_id=current_user.user_id,
        show_id=payload.show_id,
        total_amount=payload.total_amount,
        creditcard=payload.creditcard,
    )
    db.add(booking)
    await db.flush()

    existing_by_seat = {rs.seat_id: rs for rs in existing}
    for seat in seats:
        if seat.seats_id in existing_by_seat:
            existing_by_seat[seat.seats_id].booking_id = booking.booking_id
        else:
            db.add(
                ReservedSeat(
                    booking_id=booking.booking_id,
                    user_id=current_user.user_id,
                    show_id=payload.show_id,
                    seat_id=seat.seats_id,
                )
            )

    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "One or more seats were just booked by someone else. Please re-select seats.",
        )

    await db.refresh(booking)
    await db.refresh(booking, ["reserved_seats"])

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

    return booking


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


@router.post("/checkout", response_model=BookingRead, status_code=status.HTTP_201_CREATED)
async def checkout_booking(
    payload: OrderConfirmationRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    booking = await _create_booking_and_send_email(
        payload,
        background_tasks,
        db,
        current_user,
    )
    return BookingRead.model_validate(booking, from_attributes=True)


@router.post("/confirm-email", status_code=status.HTTP_202_ACCEPTED)
async def send_order_confirmation(
    payload: OrderConfirmationRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    booking = await _create_booking_and_send_email(
        payload,
        background_tasks,
        db,
        current_user,
    )
    return {"message": "Order confirmation email queued", "booking_id": booking.booking_id}
