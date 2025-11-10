from pydantic import BaseModel, ConfigDict
from datetime import datetime

class ShowBase(BaseModel):
    movieid: int
    showroom_id: int
    date_time: datetime
    duration: int

class ShowCreate(ShowBase): ...
class ShowRead(ShowBase):
    show_id: int
    model_config = ConfigDict(from_attributes=True)
