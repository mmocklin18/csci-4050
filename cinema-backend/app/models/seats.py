from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, String, ForeignKey, UniqueConstraint
from app.core.db import Base

class Seat(Base):
    __tablename__ = "seats"
    __table_args__ = (UniqueConstraint("showroom_id", "row_no", "seat_no", name="uq_seat_position"),)

    seats_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    showroom_id: Mapped[int] = mapped_column(ForeignKey("showroom.showroom_id", ondelete="CASCADE", onupdate="CASCADE"))
    seat_no: Mapped[int] = mapped_column(Integer, nullable=False)
    row_no: Mapped[str] = mapped_column(String(5), nullable=False)
