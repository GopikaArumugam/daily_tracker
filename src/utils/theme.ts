export type AccentColor = 'green' | 'blue' | 'purple' | 'rose' | 'amber';

export const getAccentColor = (
  color: AccentColor,
  type: 'text' | 'bg' | 'border' | 'ring' | 'bg-hover' | 'border-hover' | 'bg-tint' | 'border-tint' | 'text-hover' = 'text'
): string => {
  const map: Record<AccentColor, Record<string, string>> = {
    green: {
      text: 'text-emerald-700 dark:text-emerald-400',
      'text-hover': 'hover:text-emerald-800 dark:hover:text-emerald-300',
      bg: 'bg-[#a7f3d0] text-emerald-950 dark:bg-emerald-500 dark:text-zinc-950',
      'bg-hover': 'hover:bg-[#86efac] dark:hover:bg-emerald-600',
      border: 'border-emerald-250 dark:border-emerald-500',
      'border-hover': 'hover:border-emerald-350 dark:hover:border-emerald-400',
      ring: 'ring-emerald-300 dark:ring-emerald-500',
      'bg-tint': 'bg-emerald-100/60 dark:bg-emerald-500/10',
      'border-tint': 'border-emerald-200 dark:border-emerald-500/20',
    },
    blue: {
      text: 'text-sky-700 dark:text-sky-400',
      'text-hover': 'hover:text-sky-800 dark:hover:text-sky-300',
      bg: 'bg-[#bae6fd] text-sky-950 dark:bg-sky-500 dark:text-zinc-950',
      'bg-hover': 'hover:bg-[#7dd3fc] dark:hover:bg-sky-600',
      border: 'border-sky-250 dark:border-sky-500',
      'border-hover': 'hover:border-sky-350 dark:hover:border-sky-400',
      ring: 'ring-sky-300 dark:ring-sky-500',
      'bg-tint': 'bg-sky-100/60 dark:bg-sky-500/10',
      'border-tint': 'border-sky-200 dark:border-sky-500/20',
    },
    purple: {
      text: 'text-violet-700 dark:text-violet-400',
      'text-hover': 'hover:text-violet-855 dark:hover:text-violet-300',
      bg: 'bg-[#ddd6fe] text-violet-950 dark:bg-violet-500 dark:text-zinc-950',
      'bg-hover': 'hover:bg-[#c4b5fd] dark:hover:bg-violet-600',
      border: 'border-violet-250 dark:border-violet-500',
      'border-hover': 'hover:border-violet-350 dark:hover:border-violet-400',
      ring: 'ring-violet-300 dark:ring-violet-500',
      'bg-tint': 'bg-violet-100/60 dark:bg-violet-500/10',
      'border-tint': 'border-violet-200 dark:border-violet-500/20',
    },
    rose: {
      text: 'text-rose-700 dark:text-rose-400',
      'text-hover': 'hover:text-rose-800 dark:hover:text-rose-300',
      bg: 'bg-[#fecdd3] text-rose-950 dark:bg-rose-500 dark:text-zinc-950',
      'bg-hover': 'hover:bg-[#fda4af] dark:hover:bg-rose-600',
      border: 'border-rose-250 dark:border-rose-500',
      'border-hover': 'hover:border-rose-350 dark:hover:border-rose-400',
      ring: 'ring-rose-300 dark:ring-rose-500',
      'bg-tint': 'bg-rose-100/60 dark:bg-rose-500/10',
      'border-tint': 'border-rose-200 dark:border-rose-500/20',
    },
    amber: {
      text: 'text-amber-700 dark:text-amber-400',
      'text-hover': 'hover:text-amber-800 dark:hover:text-amber-300',
      bg: 'bg-[#fde68a] text-amber-950 dark:bg-amber-500 dark:text-zinc-950',
      'bg-hover': 'hover:bg-[#fcd34d] dark:hover:bg-amber-600',
      border: 'border-amber-250 dark:border-amber-500',
      'border-hover': 'hover:border-amber-350 dark:hover:border-amber-400',
      ring: 'ring-amber-300 dark:ring-amber-500',
      'bg-tint': 'bg-amber-100/60 dark:bg-amber-500/10',
      'border-tint': 'border-amber-200 dark:border-amber-500/20',
    },
  };

  return map[color]?.[type] || map.purple[type];
};
