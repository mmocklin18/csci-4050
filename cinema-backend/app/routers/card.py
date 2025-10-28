from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.db import get_session
from app.models.card import Card
from app.schemas.card import CardCreate, CardRead
from app.core.security import encrypt_data, decrypt_data

router = APIRouter(prefix="/cards", tags=["cards"])


@router.post("/", response_model=CardRead, status_code=201)
async def create_card(payload: CardCreate, session: AsyncSession = Depends(get_session)):
    """Create a new payment card for a customer."""

    # Encrypt sensitive fields before storing
    encrypted_number = encrypt_data(payload.number)
    encrypted_cvc = encrypt_data(str(payload.cvc))  

    card = Card(
        number=encrypted_number,
        billing_add=payload.billing_add,
        exp_date=payload.exp_date,
        customerid=payload.customerid,
        cvc=encrypted_cvc
    )
    card.encrypt_sensitive_fields()

    session.add(card)
    await session.commit()
    await session.refresh(card)

    # Decrypt before returning
    card.number = decrypt_data(card.number)
    card.cvc = decrypt_data(card.cvc)

    return card


@router.get("/{card_id}", response_model=CardRead)
async def get_card(card_id: int, session: AsyncSession = Depends(get_session)):
    """Fetch a stored card by ID (decrypt before returning)."""
    result = await session.execute(select(Card).where(Card.card_id == card_id))
    card = result.scalar_one_or_none()

    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")

    # Decrypt before returning to frontend
    card.number = decrypt_data(card.number)
    card.cvc = decrypt_data(card.cvc)

    return card

