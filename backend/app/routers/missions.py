from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models import Mission, Task
from app.schemas import MissionCreate, MissionUpdate, MissionOut, MissionDetailOut, TaskOut

router = APIRouter(prefix="/missions", tags=["missions"])


def _compute_mission_out(mission: Mission) -> dict:
    tasks = mission.tasks or []
    estimated_mins = sum(
        t.estimated_mins or 0
        for t in tasks
        if t.status != "done" and t.parent_task_id is None
    )
    task_count = len([t for t in tasks if t.parent_task_id is None])
    return {
        "id": mission.id,
        "name": mission.name,
        "description": mission.description,
        "estimated_mins": estimated_mins,
        "task_count": task_count,
        "created_at": str(mission.created_at) if mission.created_at else "",
        "updated_at": str(mission.updated_at) if mission.updated_at else "",
    }


@router.get("", response_model=list[MissionOut])
async def list_missions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Mission).order_by(Mission.created_at.desc()))
    missions = result.scalars().all()
    return [_compute_mission_out(m) for m in missions]


@router.post("", response_model=MissionOut, status_code=201)
async def create_mission(mission_in: MissionCreate, db: AsyncSession = Depends(get_db)):
    mission = Mission(**mission_in.model_dump())
    db.add(mission)
    await db.commit()
    await db.refresh(mission)
    return _compute_mission_out(mission)


@router.get("/{mission_id}", response_model=MissionDetailOut)
async def get_mission(mission_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Mission).where(Mission.id == mission_id))
    mission = result.scalar_one_or_none()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    data = _compute_mission_out(mission)
    parent_tasks = [t for t in (mission.tasks or []) if t.parent_task_id is None]
    data["tasks"] = parent_tasks
    return data


@router.put("/{mission_id}", response_model=MissionOut)
async def update_mission(
    mission_id: str, mission_in: MissionUpdate, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Mission).where(Mission.id == mission_id))
    mission = result.scalar_one_or_none()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    for key, value in mission_in.model_dump(exclude_unset=True).items():
        setattr(mission, key, value)
    await db.commit()
    await db.refresh(mission)
    return _compute_mission_out(mission)


@router.delete("/{mission_id}", status_code=204)
async def delete_mission(mission_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Mission).where(Mission.id == mission_id))
    mission = result.scalar_one_or_none()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    # Unassign tasks
    task_result = await db.execute(
        select(Task).where(Task.mission_id == mission_id)
    )
    for task in task_result.scalars().all():
        task.mission_id = None
    await db.delete(mission)
    await db.commit()
