from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.core.db import get_session
from app.models.show import Show
from app.schemas.show import ShowCreate, ShowRead

router = APIRouter(prefix="/shows", tags=["Shows"])

@router.get("/", response_model=List[ShowRead])
async def get_all_shows(db: AsyncSession = Depends(get_session)):
    res = await db.execute(select(Show))
    return res.scalars().all()

@router.get("/movie/{movie_id}", response_model=List[ShowRead])
async def get_shows_for_movie(movie_id: int, db: AsyncSession = Depends(get_session)):
    res = await db.execute(select(Show).where(Show.movieid == movie_id))
    return res.scalars().all()

@router.post("/", response_model=ShowRead, status_code=201)
async def create_show(payload: ShowCreate, db: AsyncSession = Depends(get_session)):
    existing = (await db.execute(select(Show).where(Show.showroom_id == payload.showroom_id))).scalars().all()

    new_start = payload.date_time
    new_start_ts = new_start.timestamp()
    new_end_ts = new_start_ts + (payload.duration * 60)

    for scheduled in existing:
        scheduled_start_ts = scheduled.date_time.timestamp()
        scheduled_end_ts = scheduled_start_ts + (scheduled.duration * 60)
        if new_start_ts < scheduled_end_ts and new_end_ts > scheduled_start_ts:
            raise HTTPException(400, "Scheduling conflict: overlaps another show in this showroom")

    new_show = Show(**payload.model_dump())
    db.add(new_show)
    await db.commit()
    await db.refresh(new_show)
    return new_show


@router.delete("/{show_id}", status_code=204)
async def delete_show(show_id: int, db: AsyncSession = Depends(get_session)):
    show = await db.get(Show, show_id)
    if not show:
        raise HTTPException(404, "Showtime not found")

    try:
        await db.delete(show)
        await db.commit()
    except Exception as exc:
        await db.rollback()
        if "1451" in str(exc):
            raise HTTPException(400, "Cannot delete a showtime that already has bookings")
        raise HTTPException(500, f"Error deleting showtime: {exc}") from exc
