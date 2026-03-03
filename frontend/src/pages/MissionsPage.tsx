import { useState } from 'react';
import { useMissions, useCreateMission } from '@/hooks';
import { MissionCard } from '@/components/MissionCard';
import { Loader2, Plus, X } from 'lucide-react';

export function MissionsPage() {
  const { data: missions, isLoading, error } = useMissions();
  const createMission = useCreateMission();
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    createMission.mutate(
      { name: formName.trim(), description: formDesc },
      {
        onSuccess: () => {
          setFormName('');
          setFormDesc('');
          setShowForm(false);
        },
      }
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Missions</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white rounded-md text-sm hover:bg-gray-800 transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Mission'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border rounded-lg p-4 bg-white mb-6 space-y-3">
          <input
            type="text"
            placeholder="Mission name"
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
          <button
            type="submit"
            disabled={createMission.isPending}
            className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm hover:bg-gray-800 disabled:opacity-50"
          >
            {createMission.isPending ? 'Creating...' : 'Create Mission'}
          </button>
        </form>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-md text-sm">
          Failed to load missions. Make sure the backend is running.
        </div>
      )}

      {missions && missions.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg font-medium">No missions yet</p>
          <p className="text-sm mt-1">Create your first mission to organize tasks.</p>
        </div>
      )}

      {missions && missions.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {missions.map((mission) => (
            <MissionCard key={mission.id} mission={mission} />
          ))}
        </div>
      )}
    </div>
  );
}
