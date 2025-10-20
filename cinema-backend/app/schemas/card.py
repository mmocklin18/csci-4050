from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional

# shared fields
class CardBase(BaseModel):
    number: str
    billing_add: str
    exp_date: date
    customerid: int

# for card creation (POST)
class CardCreate(CardBase):
    pass

# for reading card from DB (GET)
class CardRead(CardBase):
    card_id: int   # assuming the PK column is called card_id
    
    model_config = ConfigDict(from_attributes=True)
