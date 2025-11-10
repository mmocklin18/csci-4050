from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.core.db import get_session
from app.models.seats import Seat
from app.models.reserved_seats import ReservedSeat
from app.schemas.seats import SeatRead

router = APIRouter(prefix="/seats", tags=["Seats"])

@router.get("/show/{show_id}/available", response_model=List[SeatRead])
async def get_available_seats(show_id: int, db: AsyncSession = Depends(get_session)):
    # Find showroom for the show
    from app.models.show import Show
    show = await db.get(Show, show_id)
    if not show:
        return []
    # Get all seats in that showroom
    seats = (await db.execute(select(Seat).where(Seat.showroom_id == show.showroom_id))).scalars().all()
    # Find reserved seats for this show
    taken = (await db.execute(select(ReservedSeat.seat_id).where(ReservedSeat.show_id == show_id))).scalars().all()
    # Filter out taken ones
    available = [s for s in seats if s.seats_id not in taken]
    return available
