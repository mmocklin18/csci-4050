from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Text, DateTime, Boolean, Integer
from app.core.db import Base

class Movie(Base):
    __tablename__ = "movie"

    movie_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    rating: Mapped[str | None] = mapped_column(String(10))
    runtime: Mapped[int | None] = mapped_column(Integer)
    release_date: Mapped[DateTime | None] = mapped_column(DateTime)
    available: Mapped[bool] = mapped_column(Boolean, default=True)
    poster: Mapped[str | None] = mapped_column(String(500))
    trailer: Mapped[str | None] = mapped_column(String(500))
    theater: Mapped[str | None] = mapped_column(String(255))
    main_genre: Mapped[str | None] = mapped_column(String(100))
