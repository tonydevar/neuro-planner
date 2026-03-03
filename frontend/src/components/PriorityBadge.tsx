import { cn } from '@/lib/utils';
import type { Priority } from '@/types';

const PRIORITY_STYLES: Record<Priority, string> = {
  urgent: 'bg-red-100 text-red-800 border-red-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  low: 'bg-green-100 text-green-800 border-green-300',
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        PRIORITY_STYLES[priority]
      )}
    >
      {priority}
    </span>
  );
}
