import { useState } from 'react';
import { useSchedule } from '@/hooks';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const CATEGORY_BORDER_COLORS: Record<string, string> = {
  explore: 'border-l-purple-500',
  learn: 'border-l-blue-500',
  build: 'border-l-green-500',
  integrate: 'border-l-orange-500',
  office_hours: 'border-l-gray-500',
  other: 'border-l-slate-400',
};

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

export function DashboardPage() {
  const [date, setDate] = useState(() => new Date());
  const dateStr = formatDate(date);
  const { data: slots, isLoading, error } = useSchedule(dateStr);

  const prevDay = () =>
    setDate((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() - 1);
      return next;
    });
  const nextDay = () =>
    setDate((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      return next;
    });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Daily Schedule</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={prevDay}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {date.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <button
            onClick={nextDay}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-md text-sm">
          Failed to load schedule. Make sure the backend is running.
        </div>
      )}

      {slots && (
        <div className="border rounded-lg overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-3 py-2 w-20 text-gray-600 font-medium">Time</th>
                <th className="text-left px-3 py-2 text-gray-600 font-medium">Task</th>
                <th className="text-left px-3 py-2 w-1/3 text-gray-600 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot, i) => (
                <tr
                  key={i}
                  className={cn(
                    'border-b last:border-b-0 border-l-4',
                    slot.task_id
                      ? CATEGORY_BORDER_COLORS[slot.category || 'other']
                      : 'border-l-transparent',
                    slot.task_id ? 'bg-white' : 'bg-gray-50/50'
                  )}
                >
                  <td className="px-3 py-1.5 text-gray-500 font-mono text-xs">
                    {slot.time}
                  </td>
                  <td className="px-3 py-1.5">
                    {slot.task_name && (
                      <span className="font-medium text-gray-900">{slot.task_name}</span>
                    )}
                  </td>
                  <td className="px-3 py-1.5 text-gray-500 text-xs truncate max-w-0">
                    {slot.task_description || ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
