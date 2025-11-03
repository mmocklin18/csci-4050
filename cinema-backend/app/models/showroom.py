from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, String
from app.core.db import Base

class Showroom(Base):
    __tablename__ = "showroom"

    showroom_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(45), unique=True, nullable=False)
    total_seats: Mapped[int] = mapped_column(Integer, nullable=False)
