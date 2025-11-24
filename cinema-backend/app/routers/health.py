from fastapi import APIRouter, Depends, HTTPException 
from sqlalchemy.orm import Session
from ..core.dependencies import get_db
from ..core import config

router = APIRouter(prefix="/healthcheck", tags=["health"])


@router.get("/")
async def healthcheck():
    """Check container is running"""
    return {"status": "ok"}

@router.get("/db")
def healthcheck_db(db: Session = Depends(get_db)):
    # trivial query to prove DB + SSL work
    db.execute("SELECT 1")
    return {
        "status": "ok",
        "db": "ok",
        "ssl_ca_in_use": True if getattr(config, "CA_PATH", None) else False,
        "ca_path": getattr(config, "CA_PATH", None),
    }



