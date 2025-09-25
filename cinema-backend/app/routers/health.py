from fastapi import APIRouter, Depends, HTTPException 

router = APIRouter(prefix="/healthcheck", tags=["health"])

@router.get("/")
async def healthcheck():
    """Check container is running"""
    return {"status": "ok"}




