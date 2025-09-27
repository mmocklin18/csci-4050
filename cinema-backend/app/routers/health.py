from fastapi import APIRouter, Depends, HTTPException 
from sqlalchemy import text                           
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db import get_session

router = APIRouter(prefix="/healthcheck", tags=["health"])


@router.get("/")
async def healthcheck():
    """Check container is running"""
    return {"status": "ok"}

@router.get("/db")
async def db_health(db: AsyncSession = Depends(get_session)):
    """Check db connection works"""
    try:
        r = await db.execute(text("SELECT 1"))
        return {"db": "ok", "result": r.scalar_one()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB error: {e}")
    