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
    pass

#used for outgoing data (GET /movies)
class MovieRead(MovieBase):
    """Used when returning a movie from the DB"""
    movie_id: int
    
    model_config = ConfigDict(from_attributes=True)  # replaces orm_mode

