import { useState } from 'react';
import { useTasks, useCreateTask } from '@/hooks';
import { TaskCard } from '@/components/TaskCard';
import type { Category, Priority, TaskStatus } from '@/types';
import { Loader2, Plus, X } from 'lucide-react';

const CATEGORIES: Category[] = ['explore', 'learn', 'build', 'integrate', 'office_hours', 'other'];
const PRIORITIES: Priority[] = ['urgent', 'high', 'medium', 'low'];
const STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done'];

export function TasksPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPriority, setFormPriority] = useState<Priority>('medium');
  const [formCategory, setFormCategory] = useState<Category>('other');

  const filters: Record<string, string> = {};
  if (categoryFilter) filters.category = categoryFilter;
  if (statusFilter) filters.status = statusFilter;

  const { data: tasks, isLoading, error } = useTasks(Object.keys(filters).length > 0 ? filters : undefined);
  const createTask = useCreateTask();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    createTask.mutate(
      { name: formName.trim(), description: formDesc, priority: formPriority, category: formCategory },
      {
        onSuccess: () => {
          setFormName('');
          setFormDesc('');
          setFormPriority('medium');
          setFormCategory('other');
          setShowForm(false);
        },
      }
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Tasks</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white rounded-md text-sm hover:bg-gray-800 transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Task'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border rounded-lg p-4 bg-white mb-6 space-y-3">
          <input
            type="text"
            placeholder="Task name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            required
          />
          <textarea
            placeholder="Description (optional)"
            value={formDesc}
            onChange={(e) => setFormDesc(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
            rows={2}
          />
          <div className="flex gap-3">
            <select
              value={formPriority}
              onChange={(e) => setFormPriority(e.target.value as Priority)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value as Category)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={createTask.isPending}
            className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm hover:bg-gray-800 disabled:opacity-50"
          >
            {createTask.isPending ? 'Creating...' : 'Create Task'}
          </button>
        </form>
      )}

      <div className="flex gap-3 mb-4">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 border rounded-md text-sm bg-white"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c.replace('_', ' ')}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 border rounded-md text-sm bg-white"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-md text-sm">
          Failed to load tasks. Make sure the backend is running.
        </div>
      )}

      {tasks && tasks.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg font-medium">No tasks yet</p>
          <p className="text-sm mt-1">Create your first task to get started.</p>
        </div>
      )}

      {tasks && tasks.length > 0 && (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
