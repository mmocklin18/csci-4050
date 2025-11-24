from sqlalchemy import Column, Integer, String, DECIMAL
from app.core.db import Base

class Price(Base):
    __tablename__ = "prices"

    prices_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    type = Column(String(50), nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=False)
