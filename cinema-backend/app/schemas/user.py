from pydantic import BaseModel, ConfigDict, EmailStr, constr
from typing import Optional, List
from enum import Enum
from app.schemas.address import AddressRead, AddressCreate


#role options
class UserType(str, Enum):
    customer = "customer"
    admin = "admin"


# state values used in the DB
class StateType(str, Enum):
    Active = "Active"
    Inactive = "Inactive"
    Suspended = "Suspended"

#shared fields
class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    # DDL allows NULL for `type`, so make this optional
    type: Optional[UserType] = None


class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    user_id: int
    first_name: str
    last_name: str
    email: EmailStr
    type: Optional[str] = None
    phoneno: Optional[int] = None
    state: Optional[str] = None
    promo: Optional[bool] = None
    address: Optional[AddressRead]

    model_config = ConfigDict(from_attributes=True)


class UserLogin(BaseModel):
    email: EmailStr
    password: str



class UserUpdate(BaseModel):
   first_name: Optional[str] = None
   last_name: Optional[str] = None
   address: Optional[AddressCreate] = None
   new_password: Optional[constr(min_length=8)] = None
   current_password: Optional[str] = None
   promo: Optional[bool] = None


class Token(BaseModel):
    access_token: str
