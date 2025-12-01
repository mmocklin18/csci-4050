from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.db import get_session
from app.core.dependencies import get_current_user
from app.models.booking import Booking
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
    return result.scalars().all()
