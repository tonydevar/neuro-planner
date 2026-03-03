import { Link } from 'react-router-dom';
import type { Mission } from '@/types';

export function MissionCard({ mission }: { mission: Mission }) {
  return (
    <Link
      to={`/missions/${mission.id}`}
      className="block border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      <h3 className="font-medium text-gray-900">{mission.name}</h3>
      {mission.description && (
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{mission.description}</p>
      )}
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        <span>{mission.task_count} tasks</span>
        <span>{mission.estimated_mins} min estimated</span>
      </div>
    </Link>
  );
}
