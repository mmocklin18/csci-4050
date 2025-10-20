from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional
from enum import Enum

#role options
class UserType(str, Enum):
    customer = "customer"
    admin = "admin"

#shared fields
class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    type: UserType


class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    user_id: int
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
