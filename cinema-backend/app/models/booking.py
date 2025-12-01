from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.db import Base

class Booking(Base):
    __tablename__ = "booking"

    booking_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)

    show_id = Column(Integer, ForeignKey("show.show_id"), nullable=False)
    total_amount = Column(Float, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    reserved_seats = relationship("ReservedSeat", back_populates="booking")
