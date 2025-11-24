from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.db import get_session
from app.models.price import Price
from app.schemas.price import PriceRead

router = APIRouter(prefix="/prices", tags=["prices"])

@router.get("/{ticket_type}", response_model=PriceRead)
async def get_price_by_type(
    ticket_type: str,
    db: AsyncSession = Depends(get_session)
):
    ticket_type = ticket_type.lower()

    result = await db.execute(
        select(Price).where(Price.type == ticket_type)
    )
    price = result.scalars().first()

    if not price:
        raise HTTPException(status_code=404, detail="Price type not found")

    return price
