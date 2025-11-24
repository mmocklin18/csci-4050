from pydantic import BaseModel
from pydantic import ConfigDict

class PriceRead(BaseModel):
    prices_id: int
    type: str
    amount: float

    model_config = ConfigDict(from_attributes=True)
