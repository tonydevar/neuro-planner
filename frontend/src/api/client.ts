import axios from 'axios';
import type { Task, Mission, MissionDetail, ScheduleSlot, CategoryConfig } from '@/types';

const api = axios.create({
  baseURL: '/api',
});

export const CATEGORY_COLORS: Record<string, string> = {
  explore: 'purple',
  learn: 'blue',
  build: 'green',
  integrate: 'orange',
  office_hours: 'gray',
  other: 'slate',
};

export const CATEGORY_EMOJI: Record<string, string> = {
  explore: '\u{1F50D}',
  learn: '\u{1F4DA}',
  build: '\u{1F528}',
  integrate: '\u{1F517}',
  office_hours: '\u{1F4AC}',
  other: '\u{1F4CB}',
};

// Tasks
export async function fetchTasks(filters?: {
  category?: string;
  status?: string;
  mission_id?: string;
}): Promise<Task[]> {
  const { data } = await api.get('/tasks', { params: filters });
  return data;
}

export async function fetchTask(id: string): Promise<Task> {
  const { data } = await api.get(`/tasks/${id}`);
  return data;
}

export async function createTask(task: {
  name: string;
  description?: string;
  priority?: string;
  category?: string;
  mission_id?: string;
  estimated_mins?: number;
  parent_task_id?: string;
}): Promise<Task> {
  const { data } = await api.post('/tasks', task);
  return data;
}

export async function updateTask(
  id: string,
  updates: Partial<{
    name: string;
    description: string;
    priority: string;
    category: string;
    status: string;
    estimated_mins: number;
    mission_id: string;
    parent_task_id: string;
  }>
): Promise<Task> {
  const { data } = await api.put(`/tasks/${id}`, updates);
  return data;
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`);
}

export async function estimateTask(id: string): Promise<Task> {
  const { data } = await api.post(`/tasks/${id}/estimate`);
  return data;
}

export async function generateSubtasks(id: string): Promise<Task[]> {
  const { data } = await api.post(`/tasks/${id}/subtasks/generate`);
  return data;
}

// Missions
export async function fetchMissions(): Promise<Mission[]> {
  const { data } = await api.get('/missions');
  return data;
}

export async function fetchMission(id: string): Promise<MissionDetail> {
  const { data } = await api.get(`/missions/${id}`);
  return data;
}

export async function createMission(mission: {
  name: string;
  description?: string;
}): Promise<Mission> {
  const { data } = await api.post('/missions', mission);
  return data;
}

export async function updateMission(
  id: string,
  updates: Partial<{ name: string; description: string }>
): Promise<Mission> {
  const { data } = await api.put(`/missions/${id}`, updates);
  return data;
}

export async function deleteMission(id: string): Promise<void> {
  await api.delete(`/missions/${id}`);
}

// Schedule
export async function fetchSchedule(date?: string): Promise<ScheduleSlot[]> {
  const { data } = await api.get('/schedule', { params: date ? { date } : {} });
  return data;
}

// Config
export async function fetchCategoryConfig(): Promise<CategoryConfig[]> {
  const { data } = await api.get('/config/categories');
  return data;
}

export async function updateCategoryConfig(
  configs: CategoryConfig[]
): Promise<CategoryConfig[]> {
  const { data } = await api.put('/config/categories', { configs });
  return data;
}

export default api;
