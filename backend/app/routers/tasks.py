from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models import Task
from app.schemas import TaskCreate, TaskUpdate, TaskOut
from app.services import llm

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskOut])
async def list_tasks(
    category: str | None = None,
    status: str | None = None,
    mission_id: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    # Exclude archived tasks by default unless explicitly requested
    query = select(Task).where(Task.parent_task_id.is_(None))
    if status:
        query = query.where(Task.status == status)
    else:
        query = query.where(Task.status != "archived")
    if category:
        query = query.where(Task.category == category)
    if mission_id:
        query = query.where(Task.mission_id == mission_id)
    query = query.order_by(Task.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=TaskOut, status_code=201)
async def create_task(task_in: TaskCreate, db: AsyncSession = Depends(get_db)):
    task = Task(**task_in.model_dump())
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


@router.get("/{task_id}", response_model=TaskOut)
async def get_task(task_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.put("/{task_id}", response_model=TaskOut)
async def update_task(
    task_id: str, task_in: TaskUpdate, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    for key, value in task_in.model_dump(exclude_unset=True).items():
        setattr(task, key, value)
    await db.commit()
    await db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=204)
async def delete_task(task_id: str, db: AsyncSession = Depends(get_db)):
    """Soft-delete: sets task status to 'archived'. Subtasks are also archived."""
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    # Soft-delete subtasks
    subtask_result = await db.execute(
        select(Task).where(Task.parent_task_id == task_id)
    )
    for sub in subtask_result.scalars().all():
        sub.status = "archived"
    # Soft-delete the task itself
    task.status = "archived"
    await db.commit()


@router.post("/{task_id}/estimate", response_model=TaskOut)
async def estimate_task(task_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    llm_result = await llm.estimate_task(task.name, task.description)

    task.estimated_mins = llm_result.get("estimated_minutes", 30)
    # Delete old subtasks (hard delete is fine here — they're being replaced)
    await db.execute(delete(Task).where(Task.parent_task_id == task_id))
    # Create new subtasks
    for st in llm_result.get("subtasks", []):
        sub = Task(
            name=st.get("name", "Unnamed subtask"),
            description=st.get("description", ""),
            parent_task_id=task_id,
            category=task.category,
            priority=task.priority,
            mission_id=task.mission_id,
        )
        db.add(sub)
    await db.commit()
    await db.refresh(task)
    return task


@router.post("/{task_id}/subtasks/generate", response_model=list[TaskOut])
async def generate_subtasks(task_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    subtask_defs = await llm.generate_subtasks(task.name, task.description)

    new_subtasks = []
    for st in subtask_defs:
        sub = Task(
            name=st.get("name", "Unnamed subtask"),
            description=st.get("description", ""),
            parent_task_id=task_id,
            category=task.category,
            priority=task.priority,
            mission_id=task.mission_id,
        )
        db.add(sub)
        new_subtasks.append(sub)
    await db.commit()
    for sub in new_subtasks:
        await db.refresh(sub)
    return new_subtasks
