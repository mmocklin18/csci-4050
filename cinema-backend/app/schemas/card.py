from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional, Union
from app.schemas.address import AddressCreate

# shared fields
class CardBase(BaseModel):
    number: str
    address_id: Optional[int] = None
    address: Optional[AddressCreate] = None
    exp_date: Union[str, date]          
    cvc: str
    customer_id: Optional[int] = None 

# for card creation (POST)
class CardCreate(CardBase):
    pass

# for reading card from DB (GET)
class CardRead(CardBase):
    card_id: int   
    model_config = ConfigDict(from_attributes=True)
