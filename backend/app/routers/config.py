from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models import CategoryDayConfig
from app.schemas import CategoryConfigOut, CategoryConfigUpdate

router = APIRouter(prefix="/config", tags=["config"])


@router.get("/categories", response_model=list[CategoryConfigOut])
async def get_category_configs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CategoryDayConfig))
    return result.scalars().all()


@router.put("/categories", response_model=list[CategoryConfigOut])
async def update_category_configs(
    update: CategoryConfigUpdate, db: AsyncSession = Depends(get_db)
):
    for cfg in update.configs:
        result = await db.execute(
            select(CategoryDayConfig).where(
                CategoryDayConfig.category == cfg.category
            )
        )
        existing = result.scalar_one_or_none()
        if existing:
            existing.allotted_mins = cfg.allotted_mins
    await db.commit()
    result = await db.execute(select(CategoryDayConfig))
    return result.scalars().all()
