import { type ComponentType } from 'react';
import { Link } from 'react-router-dom';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ComponentType<{ className?: string }>;
  /** One-line summary under the number -- a status split or a this-month
   *  count, so the tile says something beyond a bare total. */
  hint?: string;
  /** Section this metric belongs to; makes the whole tile a way in. */
  to?: string;
  accent?: string;
  bare?: boolean;
}

export function StatCard({ label, value, icon: Icon, hint, to, bare }: StatCardProps) {
  const body = (
    <>
      <span className="absolute inset-y-0 left-0 w-1 bg-brand-500" aria-hidden="true" />
      <div className="flex items-center gap-2 text-slate-500">
        <Icon className="h-3.5 w-3.5 flex-none" />
        <p className="text-[11px] font-semibold uppercase tracking-wider">{label}</p>
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      {hint && (
        <p className="mt-auto pt-3 text-xs leading-relaxed text-slate-500" title={hint}>
          {hint}
        </p>
      )}

    </>
  );

  // `bare` drops the card chrome so several can sit inside one divided
  // panel (the home page) instead of reading as a row of separate cards.
  const shell = bare
    ? 'group relative flex h-full flex-col overflow-hidden p-3.5'
    : 'group relative flex flex-col overflow-hidden rounded-md border border-slate-200 bg-white p-3.5';
  if (!to) return <div className={shell}>{body}</div>;
  return (
    <Link to={to} className={`${shell} transition-colors hover:border-brand-300 hover:bg-brand-50/40`}>
      {body}
    </Link>
  );
}
