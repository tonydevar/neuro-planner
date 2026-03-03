import { Link } from 'react-router-dom';
import type { Task } from '@/types';
import { PriorityBadge } from './PriorityBadge';
import { CategoryBadge } from './CategoryBadge';
import { StatusToggle } from './StatusToggle';
import { useUpdateTask } from '@/hooks';
import type { TaskStatus } from '@/types';

export function TaskCard({ task }: { task: Task }) {
  const updateTask = useUpdateTask();

  const handleStatusToggle = (newStatus: TaskStatus) => {
    updateTask.mutate({ id: task.id, status: newStatus });
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <StatusToggle status={task.status} onToggle={handleStatusToggle} />
        </div>
        <div className="flex-1 min-w-0">
          <Link
            to={`/tasks/${task.id}`}
            className="text-sm font-medium text-gray-900 hover:text-blue-600 block truncate"
          >
            {task.name}
          </Link>
          {task.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <PriorityBadge priority={task.priority} />
            <CategoryBadge category={task.category} />
            {task.estimated_mins != null && (
              <span className="text-xs text-gray-500">{task.estimated_mins} min</span>
            )}
            {task.subtasks.length > 0 && (
              <span className="text-xs text-gray-400">
                {task.subtasks.filter((s) => s.status === 'done').length}/{task.subtasks.length} subtasks
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
