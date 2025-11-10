from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.core.db import get_session
from app.models.showroom import Showroom
from app.schemas.showroom import ShowroomCreate, ShowroomRead

router = APIRouter(prefix="/showrooms", tags=["Showrooms"])

@router.get("/", response_model=List[ShowroomRead])
async def list_showrooms(db: AsyncSession = Depends(get_session)):
    res = await db.execute(select(Showroom))
    return res.scalars().all()

@router.post("/", response_model=ShowroomRead, status_code=201)
async def create_showroom(payload: ShowroomCreate, db: AsyncSession = Depends(get_session)):
    room = Showroom(**payload.model_dump())
    db.add(room)
    await db.commit()
    await db.refresh(room)
    return room
