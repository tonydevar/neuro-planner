from __future__ import annotations
from datetime import datetime
from pydantic import BaseModel, field_validator
from typing import Literal, Optional


Priority = Literal["low", "medium", "high", "urgent"]
Category = Literal["explore", "learn", "build", "integrate", "office_hours", "other"]
TaskStatus = Literal["todo", "in_progress", "done", "archived"]


class TaskCreate(BaseModel):
    name: str
    description: str = ""
    priority: Priority = "medium"
    category: Category = "other"
    mission_id: Optional[str] = None
    estimated_mins: Optional[int] = None
    parent_task_id: Optional[str] = None


class TaskUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[Priority] = None
    category: Optional[Category] = None
    status: Optional[TaskStatus] = None
    estimated_mins: Optional[int] = None
    mission_id: Optional[str] = None
    parent_task_id: Optional[str] = None


class TaskOut(BaseModel):
    id: str
    name: str
    description: str
    priority: str
    category: str
    status: str
    estimated_mins: Optional[int]
    mission_id: Optional[str]
    parent_task_id: Optional[str]
    subtasks: list[TaskOut] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class MissionCreate(BaseModel):
    name: str
    description: str = ""


class MissionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class MissionOut(BaseModel):
    id: str
    name: str
    description: str
    estimated_mins: int = 0
    task_count: int = 0
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


class MissionDetailOut(MissionOut):
    tasks: list[TaskOut] = []


class ScheduleSlot(BaseModel):
    time: str
    task_id: Optional[str] = None
    task_name: Optional[str] = None
    task_description: Optional[str] = None
    category: Optional[str] = None


class CategoryConfigOut(BaseModel):
    category: str
    allotted_mins: int

    @field_validator("allotted_mins")
    @classmethod
    def allotted_mins_bounds(cls, v: int) -> int:
        if v < 0:
            raise ValueError("allotted_mins must be >= 0")
        if v > 1440:
            raise ValueError("allotted_mins must be <= 1440 (minutes in a day)")
        return v

    model_config = {"from_attributes": True}


class CategoryConfigUpdate(BaseModel):
    configs: list[CategoryConfigOut]
