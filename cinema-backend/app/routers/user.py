from fastapi import BackgroundTasks, APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.models.address import Address



from app.core.db import get_session
from app.models.user import User
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.core.dependencies import get_current_user
from app.core.security import verify_password, get_password_hash
#from app.utils.email import send_profile_update_email

router = APIRouter(prefix="/user", tags=["user"])

@router.get("/", response_model=UserRead)
async def get_user_profile(
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    await db.refresh(current_user, ["address"])
    current_user.address = current_user.address
    return current_user


@router.patch("/", response_model=UserRead)
async def update_user_info(
    payload: UserUpdate,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Update user profile and related address info."""

    user = current_user
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update name and promo
    if payload.first_name:
        user.first_name = payload.first_name
    if payload.last_name:
        user.last_name = payload.last_name
    if payload.promo is not None:
        user.promo = payload.promo

    # Handle password change
    if payload.new_password:
        if not payload.current_password or not verify_password(payload.current_password, user.password):
            raise HTTPException(status_code=403, detail="Current password is incorrect")
        user.password = get_password_hash(payload.new_password)

    # Handle address update
    if payload.address:
        addr_data = payload.address

        # Try to find an existing address with same fields
        result = await db.execute(
            select(Address).filter(
                Address.street == addr_data.street,
                Address.city == addr_data.city,
                Address.state == addr_data.state,
                Address.zip == addr_data.zip,
            )
        )
        address = result.scalar_one_or_none()

        # Create new if not found
        if not address:
            address = Address(
                street=addr_data.street,
                city=addr_data.city,
                state=addr_data.state,
                zip=addr_data.zip,
            )
            db.add(address)
            await db.flush()  # assign address_id

        # Link user to the address
        user.address_id = address.address_id

    await db.commit()
    await db.refresh(user, ["address"])
    return user

