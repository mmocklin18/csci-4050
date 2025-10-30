from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.db import get_session
from app.core.dependencies import get_current_user
from app.core.security import get_password_hash, verify_password
from app.models.address import Address
from app.models.user import User
from app.schemas.user import UserRead, UserUpdate
from app.services.email_notifications import queue_profile_update_email

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
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Update user profile and related address info."""

    user = current_user
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.refresh(user, ["address"])

    changed_fields: list[str] = []

    original_first = user.first_name
    original_last = user.last_name
    original_promo = user.promo
    original_address_id = user.address.address_id if user.address else None
    original_address_tuple = (
        user.address.street if user.address else None,
        user.address.city if user.address else None,
        user.address.state if user.address else None,
        user.address.zip if user.address else None,
    )

    # Update name and promo
    if payload.first_name and payload.first_name != original_first:
        user.first_name = payload.first_name
        changed_fields.append("first name")
    if payload.last_name and payload.last_name != original_last:
        user.last_name = payload.last_name
        changed_fields.append("last name")
    if payload.promo is not None and payload.promo != original_promo:
        user.promo = payload.promo
        changed_fields.append("promotional email preference")

    # Handle password change
    if payload.new_password:
        if not payload.current_password or not verify_password(payload.current_password, user.password):
            raise HTTPException(status_code=403, detail="Current password is incorrect")
        user.password = get_password_hash(payload.new_password)
        changed_fields.append("password")

    # Handle address update
    if payload.address:
        addr_data = payload.address

        target_tuple = (
            addr_data.street,
            addr_data.city,
            addr_data.state,
            addr_data.zip,
        )

        # find any existing address with the same fields or create new one
        result = await db.execute(
            select(Address).filter(
                Address.street == addr_data.street,
                Address.city == addr_data.city,
                Address.state == addr_data.state,
                Address.zip == addr_data.zip,
            )
        )
        address = result.scalars().first()

        if address:
            address_id = address.address_id
        else:
            address = Address(
                street=addr_data.street,
                city=addr_data.city,
                state=addr_data.state,
                zip=addr_data.zip,
            )
            db.add(address)
            await db.flush()  
            address_id = address.address_id

        user.address_id = address_id

        if target_tuple != original_address_tuple or address_id != original_address_id:
            changed_fields.append("address")

    await db.commit()
    await db.refresh(user, ["address"])

    if changed_fields:
        queue_profile_update_email(
            background_tasks,
            email=user.email,
            first_name=user.first_name,
            fields_changed=changed_fields,
        )

    return user
