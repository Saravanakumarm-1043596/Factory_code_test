export const BADGE_COLOR_CLASSES: Record<string, string> = {
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  amber: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  rose: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  sky: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  violet: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  slate: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  teal: 'bg-teal-50 text-teal-700 ring-teal-600/20',
};

export function badgeClasses(color: string | undefined): string {
  return BADGE_COLOR_CLASSES[color ?? 'slate'] ?? BADGE_COLOR_CLASSES.slate;
}
