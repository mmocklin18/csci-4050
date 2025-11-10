from pydantic import BaseModel, ConfigDict

class SeatBase(BaseModel):
    showroom_id: int
    seat_no: int
    row_no: str

class SeatCreate(SeatBase): ...
class SeatRead(SeatBase):
    seats_id: int
    model_config = ConfigDict(from_attributes=True)
