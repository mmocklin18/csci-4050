from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

#shared fields
class MovieBase(BaseModel):
    name: str
    description: Optional[str]
    rating: Optional[str]
    runtime: Optional[int]
    release_date: Optional[datetime]
    available: Optional[bool]
    poster: Optional[str]
    trailer: Optional[str]
    main_genre: Optional[str]


class MovieCreate(MovieBase):
    """Used when creating a new movie (Admin only)"""
    name: str
    description: Optional[str] = None
    rating: Optional[str] = None
    runtime: Optional[int] = None
    release_date: Optional[datetime] = None
    available: bool = True
    poster: Optional[str] = None
    trailer: Optional[str] = None
    main_genre: Optional[str] = None

    

#used for outgoing data (GET /movies)
class MovieRead(MovieBase):
    """Used when returning a movie from the DB"""
    movie_id: int
    
    model_config = ConfigDict(from_attributes=True)  # replaces orm_mode

class MovieUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    rating: Optional[str] = None
    runtime: Optional[int] = None
    release_date: Optional[datetime] = None
    available: Optional[bool] = None
    poster: Optional[str] = None
    trailer: Optional[str] = None
    main_genre: Optional[str] = None