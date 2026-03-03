# Neuro Planner

A smart planner web app with AI-powered task estimation and scheduling.

## Prerequisites

- Python 3.11+
- Node 18+
- OpenAI API key

## Backend Setup

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env and set your OPENAI_API_KEY
```

### Run Backend

```bash
cd backend
uvicorn app.main:app --reload
```

The backend will be available at http://localhost:8000.

## Frontend Setup

```bash
cd frontend
npm install
```

### Run Frontend

```bash
cd frontend
npm run dev
```

The frontend will be available at http://localhost:5173.

## Docker

```bash
docker-compose up
```

## Architecture

```
frontend/   - React 18 + TypeScript + Vite + Tailwind + shadcn/ui
backend/    - FastAPI (Python) + SQLAlchemy + SQLite + OpenAI
```

## Features

- Task management with priorities and categories
- Mission-based task organization
- AI-powered task time estimation (via OpenAI)
- AI-powered subtask generation
- Daily schedule builder with category time allotments
- Configurable category time budgets
