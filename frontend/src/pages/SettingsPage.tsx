import { useState, useEffect } from 'react';
import { useCategoryConfig, useUpdateCategoryConfig } from '@/hooks';
import { CATEGORY_EMOJI } from '@/api/client';
import type { CategoryConfig } from '@/types';
import { Loader2, Save } from 'lucide-react';

export function SettingsPage() {
  const { data: configs, isLoading, error } = useCategoryConfig();
  const updateConfig = useUpdateCategoryConfig();
  const [localConfigs, setLocalConfigs] = useState<CategoryConfig[]>([]);

  useEffect(() => {
    if (configs) {
      setLocalConfigs(configs);
    }
  }, [configs]);

  const handleChange = (category: string, value: string) => {
    setLocalConfigs((prev) =>
      prev.map((c) =>
        c.category === category ? { ...c, allotted_mins: parseInt(value) || 0 } : c
      )
    );
  };

  const handleSave = () => {
    updateConfig.mutate(localConfigs);
  };

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

        {localConfigs.length > 0 && (
          <div className="space-y-3">
            {localConfigs.map((cfg) => (
              <div key={cfg.category} className="flex items-center gap-4">
                <span className="w-40 text-sm">
                  {CATEGORY_EMOJI[cfg.category]} {cfg.category.replace('_', ' ')}
                </span>
                <input
                  type="number"
                  min={0}
                  max={480}
                  value={cfg.allotted_mins}
                  onChange={(e) => handleChange(cfg.category, e.target.value)}
                  className="w-24 px-3 py-1.5 border rounded-md text-sm text-right"
                />
                <span className="text-xs text-gray-500">min/day</span>
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
              {updateConfig.isSuccess && (
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
