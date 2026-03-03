import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useTask,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useEstimateTask,
  useGenerateSubtasks,
} from '@/hooks';
import { PriorityBadge } from '@/components/PriorityBadge';
import { CategoryBadge } from '@/components/CategoryBadge';
import { StatusToggle } from '@/components/StatusToggle';
import type { TaskStatus } from '@/types';
import { ArrowLeft, Loader2, Trash2, Sparkles, GitBranch, Plus } from 'lucide-react';

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: task, isLoading, error } = useTask(id);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const estimateTask = useEstimateTask();
  const generateSubtasks = useGenerateSubtasks();

  // Manual sub-task form state
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);
  const [subtaskName, setSubtaskName] = useState('');
  const [subtaskDesc, setSubtaskDesc] = useState('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-md text-sm">
          Task not found or failed to load.
        </div>
      </div>
    );
  }

  const handleStatusToggle = (newStatus: TaskStatus) => {
    updateTask.mutate({ id: task.id, status: newStatus });
  };

  const handleDelete = () => {
    if (confirm('Archive this task? (It will no longer appear in the task list.)')) {
      deleteTask.mutate(task.id, { onSuccess: () => navigate('/tasks') });
    }
  };

  const handleEstimate = () => {
    estimateTask.mutate(task.id);
  };

  const handleGenerateSubtasks = () => {
    generateSubtasks.mutate(task.id);
  };

  const handleAddSubtask = () => {
    if (!subtaskName.trim()) return;
    createTask.mutate(
      {
        name: subtaskName.trim(),
        description: subtaskDesc.trim(),
        parent_task_id: task.id,
        category: task.category,
        priority: task.priority,
        mission_id: task.mission_id ?? undefined,
      },
      {
        onSuccess: () => {
          setSubtaskName('');
          setSubtaskDesc('');
          setShowSubtaskForm(false);
        },
      }
    );
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/tasks')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Tasks
      </button>

      <div className="border rounded-lg p-6 bg-white">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <StatusToggle status={task.status} onToggle={handleStatusToggle} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{task.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <PriorityBadge priority={task.priority} />
                <CategoryBadge category={task.category} />
                {task.estimated_mins != null && (
                  <span className="text-sm text-gray-500">{task.estimated_mins} min</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Archive task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {task.description && (
          <p className="text-sm text-gray-600 mt-4">{task.description}</p>
        )}

        <div className="flex gap-2 mt-6">
          <button
            onClick={handleEstimate}
            disabled={estimateTask.isPending}
            className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {estimateTask.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {estimateTask.isPending ? 'Estimating...' : 'AI Estimate'}
          </button>
          <button
            onClick={handleGenerateSubtasks}
            disabled={generateSubtasks.isPending}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {generateSubtasks.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <GitBranch className="w-4 h-4" />
            )}
            {generateSubtasks.isPending ? 'Generating...' : 'Generate Subtasks'}
          </button>
        </div>

        {estimateTask.isError && (
          <div className="bg-red-50 text-red-700 px-3 py-2 rounded-md text-sm mt-3">
            Failed to estimate. Check that OPENAI_API_KEY is configured.
          </div>
        )}

        {generateSubtasks.isError && (
          <div className="bg-red-50 text-red-700 px-3 py-2 rounded-md text-sm mt-3">
            Failed to generate subtasks. Check that OPENAI_API_KEY is configured.
          </div>
        )}

        {/* Sub-tasks section */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">
              Subtasks
              {task.subtasks.length > 0 && (
                <span className="text-gray-400 font-normal ml-1">
                  ({task.subtasks.filter((s) => s.status === 'done').length}/{task.subtasks.length} done)
                </span>
              )}
            </h3>
            <button
              onClick={() => setShowSubtaskForm((v) => !v)}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add manually
            </button>
          </div>

          {/* Manual sub-task form */}
          {showSubtaskForm && (
            <div className="mb-3 p-3 bg-blue-50 rounded-md border border-blue-100">
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Subtask name *"
                  value={subtaskName}
                  onChange={(e) => setSubtaskName(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={subtaskDesc}
                  onChange={(e) => setSubtaskDesc(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddSubtask}
                    disabled={!subtaskName.trim() || createTask.isPending}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {createTask.isPending ? 'Adding...' : 'Add subtask'}
                  </button>
                  <button
                    onClick={() => {
                      setShowSubtaskForm(false);
                      setSubtaskName('');
                      setSubtaskDesc('');
                    }}
                    className="px-3 py-1 text-gray-500 rounded text-xs hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {task.subtasks.length > 0 ? (
            <div className="space-y-2">
              {task.subtasks.map((sub) => (
                <div key={sub.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
                  <StatusToggle
                    status={sub.status}
                    onToggle={(newStatus) =>
                      updateTask.mutate({ id: sub.id, status: newStatus })
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-gray-900">{sub.name}</span>
                    {sub.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{sub.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !showSubtaskForm && (
              <p className="text-xs text-gray-400 italic">
                No subtasks yet. Use "AI Estimate" or "Generate Subtasks" to auto-generate, or add one manually.
              </p>
            )
          )}
        </div>

        <div className="mt-6 pt-4 border-t text-xs text-gray-400">
          Created: {task.created_at ? new Date(task.created_at).toLocaleString() : '—'}
          {task.updated_at && (
            <> &middot; Updated: {new Date(task.updated_at).toLocaleString()}</>
          )}
        </div>
      </div>
    </div>
  );
}
