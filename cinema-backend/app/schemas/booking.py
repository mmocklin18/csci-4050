from pydantic import BaseModel, ConfigDict, Field
from typing import List
from datetime import datetime
from app.schemas.reserved_seats import ReservedSeatRead


class OrderConfirmationRequest(BaseModel):
    user_id: int
    show_id: int
    seat_ids: List[int] = Field(min_length=1)
    total_amount: float = Field(ge=0)


class BookingRead(BaseModel):
    booking_id: int
    user_id: int
    show_id: int
    total_amount: float
    created_at: datetime
    reserved_seats: list[ReservedSeatRead]

    model_config = ConfigDict(from_attributes=True)

