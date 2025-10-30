from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.db import get_session
from app.models.card import Card
from app.schemas.card import CardCreate, CardRead
from app.core.security import encrypt_data, decrypt_data
from datetime import datetime, date
from app.models.user import User
from app.services.email_notifications import queue_payment_method_email


router = APIRouter(prefix="/cards", tags=["cards"])


@router.post("/", response_model=CardRead, status_code=201)
async def create_card(
    payload: CardCreate,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
):
    """Create a new payment card for a customer."""

    count_result = await session.execute(
        select(func.count()).select_from(Card).where(Card.customer_id == payload.customer_id)
    )
    card_count = count_result.scalar_one()

    if card_count >= 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can only store up to 4 cards per user."
        )
    
    exp_input = payload.exp_date
    if isinstance(exp_input, str):
        try:
            # case: "YYYY-MM" (from <input type='month'>)
            if "-" in exp_input and len(exp_input) == 7:
                exp_date = datetime.strptime(exp_input, "%Y-%m").date()
            # case: "MM/YYYY" (common manual entry)
            elif "/" in exp_input:
                exp_date = datetime.strptime(exp_input, "%m/%Y").date()
            else:
                exp_date = datetime.fromisoformat(exp_input).date()
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid expiration date format")
    else:
        exp_date = exp_input

    # Encrypt sensitive fields before storing
    encrypted_number = encrypt_data(payload.number)
    encrypted_cvc = encrypt_data(str(payload.cvc))  

    card = Card(
        number=encrypted_number,
        address_id=payload.address_id,
        exp_date=exp_date,
        customer_id=payload.customer_id,
        cvc=encrypted_cvc
    )

    session.add(card)
    await session.commit()
    await session.refresh(card)

    user = await session.get(User, payload.customer_id)
    if user:
        digits = "".join(ch for ch in str(payload.number) if ch.isdigit())
        queue_payment_method_email(
            background_tasks,
            email=user.email,
            first_name=user.first_name,
            last_four=digits[-4:] if digits else "****",
            action="added",
        )

    # Decrypt before returning
    card.number = decrypt_data(card.number)
    card.cvc = decrypt_data(card.cvc)

    return card


@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_card(
    card_id: int,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(Card).where(Card.card_id == card_id))
    card = result.scalar_one_or_none()

    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")

    user = await session.get(User, card.customer_id)
    digits = None
    try:
        decrypted_number = decrypt_data(card.number)
        digits = "".join(ch for ch in decrypted_number if ch.isdigit())
    except Exception:
        pass

    await session.delete(card)
    await session.commit()

    if user:
        queue_payment_method_email(
            background_tasks,
            email=user.email,
            first_name=user.first_name,
            last_four=digits[-4:] if digits and len(digits) >= 4 else "****",
            action="removed",
        )

@router.get("/user/{user_id}", response_model=list[CardRead])
async def list_user_cards(user_id: int, session: AsyncSession = Depends(get_session)):
    """Fetch all cards for a given user (decrypt before returning)."""
    result = await session.execute(select(Card).where(Card.customer_id == user_id))
    cards = result.scalars().all()

    for card in cards:
        card.number = decrypt_data(card.number)
        card.cvc = decrypt_data(card.cvc)

    return cards


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
