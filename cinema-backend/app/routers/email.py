from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_session
from app.models.user import User
from app.schemas.email import VerificationEmailRequest
from app.services.email_notifications import queue_verification_email

router = APIRouter(prefix="/email", tags=["email"])


@router.post("/verification")
async def send_verification_email_route(
    payload: VerificationEmailRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
):
    """
    Queue a verification email for the given user.
    """
    user = await session.get(User, payload.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if payload.email and user.email != payload.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email does not match the user's account",
        )

    queue_verification_email(
        background_tasks,
        user_id=user.user_id,
        email=user.email,
        first_name=user.first_name,
    )
    return {"message": "Verification email queued"}
