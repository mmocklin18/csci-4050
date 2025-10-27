from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional
from enum import Enum

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
    # phoneno stored as integer in the model/table
    phoneno: Optional[int] = None
    # state enum
    state: Optional[StateType] = None
    # promo stored as tinyint -> boolean
    promo: Optional[bool] = None
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
