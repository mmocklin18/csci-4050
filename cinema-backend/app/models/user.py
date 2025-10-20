# app/models/user.py
from sqlalchemy import Column, Integer, String, Boolean, Enum
from app.core.db import Base
from app.schemas.user import UserType  # reuse your enum

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)  # will store the hashed password
    type = Column(Enum(UserType), nullable=False, default=UserType.customer)
