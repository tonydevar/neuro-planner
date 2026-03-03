from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Task, CategoryDayConfig
from app.schemas import ScheduleSlot

PRIORITY_MAP = {"urgent": 4, "high": 3, "medium": 2, "low": 1}


async def build_schedule(date_str: str, session: AsyncSession) -> list[ScheduleSlot]:
    # 1. Load category configs
    result = await session.execute(select(CategoryDayConfig))
    configs = {c.category: c.allotted_mins for c in result.scalars().all()}

    # 2. Load parent tasks that are todo or in_progress
    result = await session.execute(
        select(Task).where(
            Task.status.in_(["todo", "in_progress"]),
            Task.parent_task_id.is_(None),
        )
    )
    tasks = result.scalars().all()

    # 3. Sort by priority desc, created_at asc
    tasks.sort(
        key=lambda t: (-PRIORITY_MAP.get(t.priority, 2), t.created_at or "")
    )

    # 4. Fill category buckets
    category_remaining = dict(configs)
    scheduled_tasks: list[tuple] = []

    for task in tasks:
        cat = task.category or "other"
        remaining = category_remaining.get(cat, 0)
        duration = task.estimated_mins if task.estimated_mins else 30

        if remaining >= duration:
            scheduled_tasks.append((task, duration))
            category_remaining[cat] = remaining - duration
        elif remaining > 0:
            scheduled_tasks.append((task, remaining))
            category_remaining[cat] = 0

    # 5-6. Generate 96 time slots (00:00 to 23:45 in 15-min increments)
    slots: list[ScheduleSlot] = []
    for i in range(96):
        hour = i // 4
        minute = (i % 4) * 15
        time_str = f"{hour:02d}:{minute:02d}"
        slots.append(ScheduleSlot(time=time_str))

    # 7. Assign tasks starting at 08:00 (slot index 32)
    slot_index = 32
    for task, duration_mins in scheduled_tasks:
        num_slots = max(1, (duration_mins + 14) // 15)  # round up to 15-min slots
        for _ in range(num_slots):
            if slot_index >= 96:
                break
            slots[slot_index] = ScheduleSlot(
                time=slots[slot_index].time,
                task_id=task.id,
                task_name=task.name,
                task_description=task.description,
                category=task.category,
            )
            slot_index += 1
        if slot_index >= 96:
            break

    return slots
