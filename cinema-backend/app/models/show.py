from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, DateTime, ForeignKey, UniqueConstraint
from app.core.db import Base

class Show(Base):
    __tablename__ = "show"
    __table_args__ = (UniqueConstraint("showroom_id", "date_time", name="uq_show_conflict"),)

    show_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    movieid: Mapped[int] = mapped_column(ForeignKey("movie.movie_id", ondelete="CASCADE", onupdate="CASCADE"))
    showroom_id: Mapped[int] = mapped_column(ForeignKey("showroom.showroom_id", ondelete="CASCADE", onupdate="CASCADE"))
    date_time: Mapped[DateTime] = mapped_column(DateTime, nullable=False)
    duration: Mapped[int] = mapped_column(Integer, nullable=False)
