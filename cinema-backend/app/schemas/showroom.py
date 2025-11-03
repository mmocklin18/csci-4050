from pydantic import BaseModel, ConfigDict

class ShowroomBase(BaseModel):
    name: str
    total_seats: int

class ShowroomCreate(ShowroomBase): ...
class ShowroomRead(ShowroomBase):
    showroom_id: int
    model_config = ConfigDict(from_attributes=True)
