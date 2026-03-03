import { cn } from '@/lib/utils';
import type { TaskStatus } from '@/types';

const STATUS_STYLES: Record<TaskStatus, string> = {
  todo: 'border-gray-400 bg-white',
  in_progress: 'border-blue-500 bg-blue-500',
  done: 'border-green-500 bg-green-500',
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: 'todo',
};

export function StatusToggle({
  status,
  onToggle,
}: {
  status: TaskStatus;
  onToggle: (newStatus: TaskStatus) => void;
}) {
  return (
    <button
      onClick={() => onToggle(NEXT_STATUS[status])}
      className={cn(
        'w-5 h-5 rounded-full border-2 cursor-pointer transition-colors flex items-center justify-center',
        STATUS_STYLES[status]
      )}
      title={`${STATUS_LABELS[status]} - click to change`}
    >
      {status === 'done' && (
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {status === 'in_progress' && (
        <div className="w-2 h-2 bg-white rounded-full" />
      )}
    </button>
  );
}
