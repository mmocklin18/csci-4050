from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.db import get_session
from app.models.reserved_seats import ReservedSeat
from app.schemas.reserved_seats import ReservedSeatCreate, ReservedSeatRead
from sqlalchemy.exc import IntegrityError

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
