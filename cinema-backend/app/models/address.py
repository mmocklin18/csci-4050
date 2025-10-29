from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.core.db import Base

class Address(Base):
    __tablename__ = "address"

    address_id = Column(Integer, primary_key=True, index=True)
    street = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    zip = Column(String(10), nullable=True)

    users = relationship("User", back_populates="address")
    cards = relationship("Card", back_populates="address")


    def __repr__(self):
        return f"<Address(id={self.address_id}, street='{self.street}', city='{self.city}', state='{self.state}', zip='{self.zip}')>"
