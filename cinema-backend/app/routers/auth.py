from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.db import get_session
from app.models.user import User
from app.schemas.user import UserCreate, UserRead, Token
from app.core.security import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])



@router.post("/signup", response_model=UserRead, status_code=201)
async def signup(payload: UserCreate, session: AsyncSession = Depends(get_session)):
    # Check if email already exists
    result = await session.execute(select(User).where(User.email == payload.email))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    # Create user instance
    user = User(
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=payload.email,
        password=get_password_hash(payload.password),
        type=payload.type,
    )

    # Stage and commit
    session.add(user)
    await session.commit()
    await session.refresh(user)

    # Return user data
    return user

@router.post("/login", response_model=Token)
async def login(payload: UserCreate, session: AsyncSession = Depends(get_session)):
    # Find user by email
    result = await session.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # Create JWT
    token = create_access_token(subject=user.user_id)
    return {"access_token": token}

