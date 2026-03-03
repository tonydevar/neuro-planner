import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from sqlalchemy import select
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./data.db")

engine = create_async_engine(DATABASE_URL, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()


async def get_db():
    async with async_session() as session:
        yield session


CATEGORIES = ["explore", "learn", "build", "integrate", "office_hours", "other"]


async def init_db():
    from app.models import Task, Mission, CategoryDayConfig  # noqa: F811

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        result = await session.execute(select(CategoryDayConfig))
        existing = result.scalars().all()
        if not existing:
            for cat in CATEGORIES:
                session.add(CategoryDayConfig(category=cat, allotted_mins=60))
            await session.commit()
