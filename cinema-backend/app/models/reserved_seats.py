from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from app.core.db import Base

class ReservedSeat(Base):
    __tablename__ = "reserved_seats"
    __table_args__ = (UniqueConstraint("show_id", "seat_id", name="uq_show_seat_taken"),)

    reserved_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    show_id: Mapped[int] = mapped_column(ForeignKey("show.show_id", ondelete="CASCADE", onupdate="CASCADE"))
    seat_id: Mapped[int] = mapped_column(ForeignKey("seats.seats_id", ondelete="CASCADE", onupdate="CASCADE"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id", ondelete="CASCADE", onupdate="CASCADE"))
    booked_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
