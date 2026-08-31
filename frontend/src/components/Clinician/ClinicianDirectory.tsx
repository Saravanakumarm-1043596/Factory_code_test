import { Pencil as PencilIcon, Trash2 as Trash2Icon, Eye as EyeIcon } from 'lucide-react';
import type { Clinician } from '../../types/Clinician';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { formatCell } from '../../lib/format';

const clinicianDirectoryBadgeColorMap: Record<string, string> = {
  'Active': 'indigo',
  'On Leave': 'emerald',
  'Inactive': 'amber',
};

interface ClinicianDirectoryProps {
  rows: Clinician[];
  loading: boolean;
  onEdit: (row: Clinician) => void;
  onDelete: (row: Clinician) => void;
  onView: (row: Clinician) => void;
  onAddNew: () => void;
}

function initialsOf(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  const chars = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '');
  return chars.join('') || '?';
}

export function ClinicianDirectory({ rows, loading, onEdit, onDelete, onView, onAddNew }: ClinicianDirectoryProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center rounded-md border border-slate-200 bg-white p-3.5 animate-pulse">
            <div className="h-14 w-14 rounded-full bg-slate-100" />
            <div className="mt-3 h-3.5 w-2/3 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-slate-200 bg-white">
        <EmptyState
          title="No records yet"
          description="Get started by creating your first record."
          action={
            <button
              onClick={onAddNew}
              className="mt-2 rounded-sm bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-500"
            >
              Add new
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {rows.map((row) => {
        const label = formatCell(row.first_name);
        return (
          <div key={String(row.clinician_id)} className="flex flex-col items-center text-center rounded-md border border-slate-200 bg-white p-3.5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-base font-semibold text-brand-700">
              {initialsOf(label)}
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-900">{label}</p>
            <p className="mt-0.5 text-xs text-slate-500">{formatCell(row.last_name)}</p>
            <div className="mt-1"><Badge label={String(row.status ?? '—')} color={clinicianDirectoryBadgeColorMap[String(row.status)]} /></div>
            <div className="mt-3 flex items-center justify-center gap-1">
              <button onClick={() => onView(row)} className="rounded-sm p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="View">
                <EyeIcon className="h-4 w-4" />
              </button>
              <button onClick={() => onEdit(row)} className="rounded-sm p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600" aria-label="Edit">
                <PencilIcon className="h-4 w-4" />
              </button>
              <button onClick={() => onDelete(row)} className="rounded-sm p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600" aria-label="Delete">
                <Trash2Icon className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
