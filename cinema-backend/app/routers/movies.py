from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.core.db import get_session
from app.models.movie import Movie
from app.schemas.movie import MovieRead

router = APIRouter(prefix="/movies", tags=["movies"])

@router.get("/", response_model=List[MovieRead])
async def get_all_movies(db: AsyncSession = Depends(get_session)):
    """Return all movies in the database"""
    try:
        result = await db.execute(select(Movie))
        movies = result.scalars().all()
        return movies
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching all movies: {e}")
