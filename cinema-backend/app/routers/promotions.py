from typing import List

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_session
from app.models.user import User, StateType
from app.models.promotion import Promotion
from app.schemas.promotion import PromotionCreate, PromotionRead
from app.services.email_notifications import queue_promotion_email

router = APIRouter(prefix="/admin/promotions", tags=["promotions"])


@router.get("/", response_model=List[PromotionRead])
async def list_promotions(db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(Promotion))
    return result.scalars().all()


@router.post("/", response_model=PromotionRead, status_code=status.HTTP_201_CREATED)
async def create_promotion(
    payload: PromotionCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_session),
):
    existing = await db.execute(select(Promotion).where(Promotion.code == payload.code))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Promotion code already exists")

    promo = Promotion(**payload.model_dump())
    db.add(promo)
    try:
        await db.commit()
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating promotion: {exc}") from exc

    await db.refresh(promo)

    subscribers = await db.execute(
        select(User).where(
            User.promo.is_(True),
            User.state == StateType.Active,
        )
    )

    for user in subscribers.scalars().all():
        queue_promotion_email(
            background_tasks,
            email=user.email,
            first_name=user.first_name,
            code=promo.code,
            discount=promo.discount,
            start_date=promo.start_date,
            end_date=promo.end_date,
        )

    return promo


@router.post("/{promotion_id}/notify", status_code=status.HTTP_202_ACCEPTED)
async def notify_promotion(
    promotion_id: int,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_session),
):
    promo = await db.get(Promotion, promotion_id)
    if not promo:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Promotion not found")

    subscribers = await db.execute(
        select(User).where(
            User.promo.is_(True),
            User.state == StateType.Active,
        )
    )

    for user in subscribers.scalars().all():
        queue_promotion_email(
            background_tasks,
            email=user.email,
            first_name=user.first_name,
            code=promo.code,
            discount=promo.discount,
            start_date=promo.start_date,
            end_date=promo.end_date,
        )

    return {"message": "Promotion emails queued"}


@router.delete("/{promotion_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_promotion(promotion_id: int, db: AsyncSession = Depends(get_session)):
    promo = await db.get(Promotion, promotion_id)
    if not promo:
        raise HTTPException(status_code=404, detail="Promotion not found")

    try:
        await db.delete(promo)
        await db.commit()
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting promotion: {exc}") from exc
