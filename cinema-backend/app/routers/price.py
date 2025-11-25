from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.db import get_session
from app.models.price import Price
from app.schemas.price import PriceRead

price_router = APIRouter(prefix="/prices", tags=["prices"])


@price_router.get("/", response_model=list[PriceRead])
async def get_all_prices(db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(Price))
    return result.scalars().all()


@price_router.get("/{ticket_type}", response_model=PriceRead)
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

router = price_router