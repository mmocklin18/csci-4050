from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict


class PromotionBase(BaseModel):
    code: str
    discount: int
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class PromotionCreate(PromotionBase):
    pass


class PromotionRead(PromotionBase):
    promotions_id: int

    model_config = ConfigDict(from_attributes=True)
