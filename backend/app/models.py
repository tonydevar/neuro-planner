import uuid
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(Text, default="")
    priority = Column(String, default="medium")
    category = Column(String, default="other")
    status = Column(String, default="todo")
    estimated_mins = Column(Integer, nullable=True)
    mission_id = Column(String, ForeignKey("missions.id"), nullable=True)
    parent_task_id = Column(String, ForeignKey("tasks.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    subtasks = relationship(
        "Task",
        back_populates="parent_ref",
        foreign_keys=[parent_task_id],
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    parent_ref = relationship(
        "Task",
        back_populates="subtasks",
        foreign_keys=[parent_task_id],
        remote_side=[id],
    )
    mission = relationship("Mission", back_populates="tasks")


class Mission(Base):
    __tablename__ = "missions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(Text, default="")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    tasks = relationship("Task", back_populates="mission", lazy="selectin")


class CategoryDayConfig(Base):
    __tablename__ = "category_day_configs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    category = Column(String, unique=True, nullable=False)
    allotted_mins = Column(Integer, default=60)
