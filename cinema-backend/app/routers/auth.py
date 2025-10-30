from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.db import get_session
from app.core.security import create_access_token, get_password_hash, verify_password
from app.core.verification import VerificationParams, validate_verification_params
from app.models.user import User
from app.schemas.user import (
    PasswordResetConfirm,
    PasswordResetRequest,
    SignupResponse,
    Token,
    UserCreate,
    UserLogin,
    UserType,
)
from app.services.email_notifications import (
    queue_password_reset_email,
    queue_verification_email,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=SignupResponse, status_code=201)
async def signup(
    payload: UserCreate,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(User).where(User.email == payload.email))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user = User(
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=payload.email,
        password=get_password_hash(payload.password),
        type=None,
        promo=bool(payload.promo),
    )

    session.add(user)
    await session.flush()

    # optional billing address 
    if payload.address:
        from app.models.address import Address

        addr = Address(
            street=payload.address.street,
            city=payload.address.city,
            state=payload.address.state,
            zip=payload.address.zip,
        )
        session.add(addr)
        await session.flush()
        user.address_id = addr.address_id

    # optional payment info
    if payload.payment_method:
        from app.models.card import Card
        from datetime import datetime, date

        card_info = payload.payment_method
        if isinstance(card_info.exp_date, str):
            try:
                exp_date = datetime.strptime(card_info.exp_date, "%m/%Y").date()
            except ValueError:
                exp_date = date.fromisoformat(card_info.exp_date)
        else:
            exp_date = card_info.exp_date

        card = Card(
            number=card_info.number,
            address_id=user.address_id or addr.address_id,
            exp_date=exp_date,
            customer_id=user.user_id,
            cvc=card_info.cvc,
        )
        card.encrypt_sensitive_fields()
        session.add(card)

    await session.commit()
    await session.refresh(user)


    queue_verification_email(
        background_tasks,
        user_id=user.user_id,
        email=user.email,
        first_name=user.first_name,
    )

    return SignupResponse(
        message="Account created. Please check your email to verify before logging in.",
        user_id=user.user_id,
    )


@router.post("/login", response_model=Token)
async def login(payload: UserLogin, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    if user.type is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account pending email verification",
        )

    token = create_access_token(subject=user.user_id)
    return {
        "access_token": token,
        "token": token,
        "token_type": "bearer",
        "user": {
            "user_id": user.user_id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,    
            "type": user.type
        },
    }


@router.get("/verify")
async def verify_email(
    uid: int,
    ts: int,
    sig: str,
    purpose: str = "verify",
    session: AsyncSession = Depends(get_session),
):
    params = VerificationParams(uid=uid, ts=ts, sig=sig, purpose=purpose)
    user = await session.get(User, uid)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found",
        )

    try:
        validate_verification_params(
            params,
            email=user.email,
            expected_purpose="verify",
            ttl_hours=settings.VERIFICATION_TTL_HOURS,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    if user.type == UserType.customer:
        return {"message": "Account already verified"}

    user.type = UserType.customer
    session.add(user)
    await session.commit()

    return {"message": "Email verified successfully"}


@router.post("/forgot-password", status_code=status.HTTP_202_ACCEPTED)
async def forgot_password(
    payload: PasswordResetRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if user:
        queue_password_reset_email(
            background_tasks,
            user_id=user.user_id,
            email=user.email,
            first_name=user.first_name,
        )

    return {
        "message": "If this email is associated with an account, a password reset link has been sent."
    }


@router.post("/reset-password")
async def reset_password(
    payload: PasswordResetConfirm,
    session: AsyncSession = Depends(get_session),
):
    params = VerificationParams(
        uid=payload.uid,
        ts=payload.ts,
        sig=payload.sig,
        purpose=payload.purpose,
    )
    user = await session.get(User, payload.uid)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found",
        )

    try:
        validate_verification_params(
            params,
            email=user.email,
            expected_purpose="password_reset",
            ttl_hours=settings.PASSWORD_RESET_TTL_HOURS,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    user.password = get_password_hash(payload.password)
    session.add(user)
    await session.commit()

    return {"message": "Password updated successfully"}
