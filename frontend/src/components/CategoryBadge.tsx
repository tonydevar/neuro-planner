import { cn } from '@/lib/utils';
import type { Category } from '@/types';
import { CATEGORY_EMOJI } from '@/api/client';

const CATEGORY_STYLES: Record<Category, string> = {
  explore: 'bg-purple-100 text-purple-800 border-purple-300',
  learn: 'bg-blue-100 text-blue-800 border-blue-300',
  build: 'bg-green-100 text-green-800 border-green-300',
  integrate: 'bg-orange-100 text-orange-800 border-orange-300',
  office_hours: 'bg-gray-100 text-gray-800 border-gray-300',
  other: 'bg-slate-100 text-slate-800 border-slate-300',
};

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
        CATEGORY_STYLES[category]
      )}
    >
      {CATEGORY_EMOJI[category]} {category.replace('_', ' ')}
    </span>
  );
}
