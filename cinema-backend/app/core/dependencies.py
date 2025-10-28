from fastapi import Depends, HTTPException, Header, status
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User
from app.core.db import get_session
from app.core.security import decode_access_token


async def get_current_user(
   authorization: str = Header(None),
   session: AsyncSession = Depends(get_session)
) -> User:
   if not authorization or not authorization.startswith("Bearer "):
       raise HTTPException(
           status_code=status.HTTP_401_UNAUTHORIZED,
           detail="Missing or invalid authorization header",
       )

   token = authorization.split(" ")[1]

   try:
       payload = decode_access_token(token)
       user_id = payload.get("sub")
       if not user_id:
           raise HTTPException(status_code=401, detail="Invalid token payload")
   except JWTError:
       raise HTTPException(status_code=401, detail="Invalid token")


   result = await session.execute(select(User).where(User.user_id == int(user_id)))
   user = result.scalar_one_or_none()


   if not user:
       raise HTTPException(status_code=404, detail="User not found")


   return user
