from pydantic import BaseModel, Field


class OrderConfirmationRequest(BaseModel):
    user_id: int
    show_id: int
    seat_ids: list[int] = Field(min_length=1)
    total_amount: float = Field(ge=0)
