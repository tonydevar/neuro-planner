import { useState } from 'react';
import { useCategoryConfig, useUpdateCategoryConfig } from '@/hooks';
import { CATEGORY_EMOJI } from '@/api/client';
import type { CategoryConfig } from '@/types';
import { Loader2, Save } from 'lucide-react';

export function SettingsPage() {
  const { data: configs, isLoading, error } = useCategoryConfig();
  const updateConfig = useUpdateCategoryConfig();

  // Track unsaved edits as an overlay on top of server state.
  // Key: category name, Value: edited allotted_mins.
  const [edits, setEdits] = useState<Record<string, number>>({});

  const handleChange = (category: string, value: string) => {
    const parsed = parseInt(value);
    setEdits((prev) => ({ ...prev, [category]: isNaN(parsed) ? 0 : parsed }));
  };

  const handleSave = () => {
    if (!configs) return;
    const merged: CategoryConfig[] = configs.map((c) => ({
      ...c,
      allotted_mins: edits[c.category] ?? c.allotted_mins,
    }));
    updateConfig.mutate(merged, {
      onSuccess: () => setEdits({}),
    });
  };

  // Merge server configs with unsaved edits for display
  const displayConfigs: CategoryConfig[] = (configs ?? []).map((c) => ({
    ...c,
    allotted_mins: edits[c.category] ?? c.allotted_mins,
  }));

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Settings</h2>

      <div className="border rounded-lg p-6 bg-white">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Daily Category Time Allotments</h3>
        <p className="text-xs text-gray-500 mb-4">
          Set how many minutes per day you want to allocate to each category.
        </p>

        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-md text-sm">
            Failed to load settings.
          </div>
        )}

        {displayConfigs.length > 0 && (
          <div className="space-y-3">
            {displayConfigs.map((cfg) => (
              <div key={cfg.category} className="flex items-center gap-4">
                <span className="w-40 text-sm">
                  {CATEGORY_EMOJI[cfg.category]} {cfg.category.replace('_', ' ')}
                </span>
                <input
                  type="number"
                  min={0}
                  max={1440}
                  value={cfg.allotted_mins}
                  onChange={(e) => handleChange(cfg.category, e.target.value)}
                  className="w-24 px-3 py-1.5 border rounded-md text-sm text-right"
                />
                <span className="text-xs text-gray-500">
                  min ({(cfg.allotted_mins / 60).toFixed(1)}h)
                </span>
              </div>
            ))}
            <div className="pt-4">
              <button
                onClick={handleSave}
                disabled={updateConfig.isPending}
                className="flex items-center gap-1 px-4 py-2 bg-gray-900 text-white rounded-md text-sm hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {updateConfig.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {updateConfig.isPending ? 'Saving...' : 'Save'}
              </button>
              {updateConfig.isSuccess && Object.keys(edits).length === 0 && (
                <span className="text-xs text-green-600 ml-3">Saved!</span>
              )}
              {updateConfig.isError && (
                <span className="text-xs text-red-600 ml-3">Failed to save.</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
