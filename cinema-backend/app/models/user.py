from enum import Enum as PyEnum
from sqlalchemy import Column, Integer, String, Boolean, Enum, ForeignKey, text
from sqlalchemy.orm import relationship, joinedload
from app.core.db import Base
from app.models.card import Card
from sqlalchemy.orm import relationship 
from app.schemas.user import UserType  # reuse your enum

class StateType(PyEnum):
    Active = "Active"
    Inactive = "Inactive"
    Suspended = "Suspended"

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(200), unique=True, nullable=False, index=True)
    password = Column(String(100), nullable=False)
    type = Column(Enum(UserType), nullable=True)
    phoneno = Column(Integer, nullable=True)
    state = Column(Enum(StateType, name="user_state"), nullable=True, server_default=text("'Active'"))
    promo = Column(Boolean, nullable=True, server_default=text('0'))
    
    cards = relationship("Card", back_populates="user", cascade="all, delete")
    promo = Column(Boolean, nullable=True, server_default=text("0"))
    address_id = Column(Integer, ForeignKey("address.address_id"), nullable=True)

    address = relationship("Address", back_populates="users", lazy="joined")
