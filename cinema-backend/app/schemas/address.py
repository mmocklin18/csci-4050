from pydantic import BaseModel
from typing import Optional

class AddressBase(BaseModel):
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip: Optional[str] = None

class AddressCreate(AddressBase):
    pass

class AddressRead(AddressBase):
    address_id: int

    class Config:
        orm_mode = True

