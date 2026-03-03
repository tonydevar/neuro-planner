from datetime import date as date_mod
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas import ScheduleSlot
from app.services.scheduler import build_schedule

router = APIRouter(prefix="/schedule", tags=["schedule"])


@router.get("", response_model=list[ScheduleSlot])
async def get_schedule(
    date: str = Query(default=None, description="Date in YYYY-MM-DD format"),
    db: AsyncSession = Depends(get_db),
):
    date_str = date or str(date_mod.today())
    return await build_schedule(date_str, db)
