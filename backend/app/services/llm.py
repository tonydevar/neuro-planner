import os
import json
from fastapi import HTTPException
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()


def _get_client() -> AsyncOpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key == "sk-...":
        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY is not configured. Set it in backend/.env",
        )
    return AsyncOpenAI(api_key=api_key)


async def estimate_task(name: str, description: str) -> dict:
    client = _get_client()
    prompt = (
        "You are a productivity assistant. Given the following task, estimate how many "
        "minutes it will take to complete and break it into 3-7 concrete sub-tasks.\n\n"
        f"Task: {name}\nDescription: {description}\n\n"
        'Respond ONLY with JSON:\n'
        '{"estimated_minutes": <integer>, "subtasks": [{"name": "...", "description": "..."}]}'
    )
    try:
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM request failed: {str(e)}")


async def generate_subtasks(name: str, description: str) -> list:
    client = _get_client()
    prompt = (
        "You are a productivity assistant. Given the following task, break it into "
        "3-7 concrete sub-tasks.\n\n"
        f"Task: {name}\nDescription: {description}\n\n"
        'Respond ONLY with JSON:\n'
        '{"subtasks": [{"name": "...", "description": "..."}]}'
    )
    try:
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content
        data = json.loads(content)
        return data.get("subtasks", [])
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM request failed: {str(e)}")
