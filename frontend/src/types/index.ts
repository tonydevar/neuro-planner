export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Category = 'explore' | 'learn' | 'build' | 'integrate' | 'office_hours' | 'other';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  name: string;
  description: string;
  priority: Priority;
  category: Category;
  status: TaskStatus;
  estimated_mins: number | null;
  mission_id: string | null;
  parent_task_id: string | null;
  subtasks: Task[];
  created_at: string;
  updated_at: string;
}

export interface Mission {
  id: string;
  name: string;
  description: string;
  estimated_mins: number;
  task_count: number;
  created_at: string;
  updated_at: string;
}

export interface MissionDetail extends Mission {
  tasks: Task[];
}

export interface ScheduleSlot {
  time: string;
  task_id: string | null;
  task_name: string | null;
  task_description: string | null;
  category: Category | null;
}

export interface CategoryConfig {
  category: Category;
  allotted_mins: number;
}
