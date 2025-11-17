from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from sqlalchemy import and_
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
    #prevent conflict for same showroom, same time
    q = select(Show).where(
        and_(
            Show.showroom_id == payload.showroom_id,
            Show.date_time == payload.date_time
        )
    )
    if (await db.execute(q)).scalar_one_or_none():
        raise HTTPException(400, "Scheduling conflict: another movie is set in that showroom at that time")

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
