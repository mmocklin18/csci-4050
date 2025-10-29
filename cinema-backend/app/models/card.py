from sqlalchemy import Column, Integer, Date, ForeignKey, String
from sqlalchemy.orm import relationship
from app.core.db import Base
from app.core.security import encrypt_data, decrypt_data

class Card(Base):
    __tablename__ = "cards"

    card_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    number = Column(String(255), nullable=False)
    address_id = Column(Integer, ForeignKey("address.address_id"), nullable=False)
    exp_date = Column(Date, nullable=False)
    customer_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    cvc = Column(String(255), nullable=False)

    user = relationship("User", back_populates="cards")
    address = relationship("Address", back_populates="cards")

    # Encrypt sensitive fields before saving
    def encrypt_sensitive_fields(self):
        self.number = encrypt_data(self.number)
        self.cvc = encrypt_data(self.cvc)

    # Decrypt sensitive fields when reading
    def decrypt_sensitive_fields(self):
        self.number = decrypt_data(self.number)
        self.cvc = decrypt_data(self.cvc)
