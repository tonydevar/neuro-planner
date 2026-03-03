import { useParams, useNavigate } from 'react-router-dom';
import { useMission, useDeleteMission } from '@/hooks';
import { TaskCard } from '@/components/TaskCard';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';

export function MissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: mission, isLoading, error } = useMission(id);
  const deleteMission = useDeleteMission();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !mission) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-md text-sm">
          Mission not found or failed to load.
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('Delete this mission? Tasks will be unassigned.')) {
      deleteMission.mutate(mission.id, { onSuccess: () => navigate('/missions') });
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/missions')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Missions
      </button>

      <div className="border rounded-lg p-6 bg-white mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{mission.name}</h2>
            {mission.description && (
              <p className="text-sm text-gray-600 mt-2">{mission.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span>{mission.task_count} tasks</span>
              <span>{mission.estimated_mins} min estimated</span>
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete mission"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <h3 className="text-sm font-medium text-gray-900 mb-3">Tasks</h3>
      {mission.tasks.length === 0 ? (
        <div className="text-center py-10 text-gray-500 text-sm">
          No tasks assigned to this mission yet.
        </div>
      ) : (
        <div className="space-y-2">
          {mission.tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
