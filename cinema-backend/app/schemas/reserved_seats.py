from pydantic import BaseModel, ConfigDict
from datetime import datetime

class ReservedSeatBase(BaseModel):
    show_id: int
    seat_id: int
    user_id: int

class ReservedSeatCreate(ReservedSeatBase): ...
class ReservedSeatRead(ReservedSeatBase):
    reserved_id: int
    booked_at: datetime
    model_config = ConfigDict(from_attributes=True)
