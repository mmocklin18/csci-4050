from fastapi import BackgroundTasks, APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.core.db import get_session
from app.models.user import User
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.core.dependencies import get_current_user
from app.core.security import verify_password, get_password_hash
#from app.utils.email import send_profile_update_email


router = APIRouter(prefix="/user", tags=["user"])

@router.patch("/", response_model=UserRead)
async def update_user_info(
    payload: UserUpdate,
    db: AsyncSession = Depends(get_session),
    user_id: int = Depends(get_current_user)
):
    """Update info for editing profile info"""
    # Fetch current user
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Raise error if email is changed
    if payload.email and payload.email != user.email:
        raise HTTPException(status_code=400, detail="Email address cannot be modified")

    # Verify old password, then update new password
    if payload.new_password:
        if not payload.current_password or not verify_password(payload.current_password, user.password_hash):
            raise HTTPException(status_code=403, detail="Current password is incorrect")
        user.password_hash = get_password_hash(payload.new_password)

    # Update name and promotions info
    if payload.first_name:
        user.first_name = payload.first_name
    if payload.last_name:
        user.last_name = payload.last_name
    if payload.subscribe_promotions is not None:
        user.subscribe_promotions = payload.subscribe_promotions


    # --- Save changes ---
    await db.commit()
    await db.refresh(user)

    #send_profile_update_email(user.email)

    return user