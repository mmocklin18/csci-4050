from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.core.db import get_session
from app.models.movie import Movie
from app.schemas.movie import MovieRead, MovieCreate, MovieUpdate

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


@router.get("/{movie_id}", response_model=MovieRead)
async def get_movie(movie_id: int, db: AsyncSession = Depends(get_session)):
    movie = await db.get(Movie, movie_id)
    if not movie:
        raise HTTPException(404, "Movie not found")
    return movie

@router.put("/{movie_id}", response_model=MovieRead)
async def update_movie(
    movie_id: int,
    payload: MovieUpdate,
    db: AsyncSession = Depends(get_session),
):
    movie = await db.get(Movie, movie_id)
    if not movie:
        raise HTTPException(404, "Movie not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(movie, field, value)

    try:
        await db.commit()
        await db.refresh(movie)
        return movie
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating movie: {e}")


@router.delete("/{movie_id}", status_code=status.HTTP_200_OK)
async def delete_movie(movie_id: int, db: AsyncSession = Depends(get_session)):
    movie = await db.get(Movie, movie_id)
    if not movie:
        raise HTTPException(404, "Movie not found")
    await db.delete(movie)
    await db.commit()
    return {"message": f"Movie {movie_id} deleted successfully"}


@router.post("/", response_model=MovieRead, status_code=201)
async def create_movie(movie: MovieCreate, db: AsyncSession = Depends(get_session)):
    """Admin adds a new movie."""
    try:
        new_movie = Movie(**movie.model_dump())
        db.add(new_movie)
        await db.commit()
        await db.refresh(new_movie)
        return new_movie
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error adding movie: {e}")

