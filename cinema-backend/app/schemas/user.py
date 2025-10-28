from pydantic import BaseModel, ConfigDict, EmailStr, constr
from typing import Optional, List
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

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# class PaymentCard(BaseModel):
#     card_type: constr(strip_whitespace=True, min_length=2)
#     card_number: constr(strip_whitespace=True, min_length=2)
#     expiration_date: str  
#     billing_address: Optional[str]

# class Address(BaseModel):
#     street: str
#     city: str
#     state: str
#     zip_code: int

class UserUpdate(BaseModel):
    first_name: Optional[str]
    last_name: Optional[str]
    address: Optional[str]
    new_password: Optional[constr(min_length=8)]
    current_password: Optional[str]
    promotions: Optional[bool]


class Token(BaseModel):
    access_token: str
