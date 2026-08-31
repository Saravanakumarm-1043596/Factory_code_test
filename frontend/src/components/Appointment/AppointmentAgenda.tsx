import { useMemo } from 'react';
import { Pencil as PencilIcon, Trash2 as Trash2Icon, Eye as EyeIcon } from 'lucide-react';
import type { Appointment } from '../../types/Appointment';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { formatCell } from '../../lib/format';

const appointmentAgendaBadgeColorMap: Record<string, string> = {
  'In-Person': 'indigo',
  'Telehealth': 'emerald',
  'Phone': 'amber',
  'Home Visit': 'rose',
};

interface AppointmentAgendaProps {
  rows: Appointment[];
  loading: boolean;
  onEdit: (row: Appointment) => void;
  onDelete: (row: Appointment) => void;
  onView: (row: Appointment) => void;
  onAddNew: () => void;
}

export function AppointmentAgenda({ rows, loading, onEdit, onDelete, onView, onAddNew }: AppointmentAgendaProps) {
  // Computed before the early returns below -- hooks must run unconditionally
  // on every render, so this can't sit after the loading/empty-state checks.
  const sorted = useMemo(
    () => [...rows].sort((a, b) => String(a.created_at ?? '').localeCompare(String(b.created_at ?? ''))),
    [rows],
  );

  if (loading) {
    return <div className="h-64 animate-pulse rounded-md border border-slate-200 bg-white p-3.5" />;
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
    <div className="rounded-md border border-slate-200 bg-white divide-y divide-slate-100">
      {sorted.map((row) => (
        <div key={String(row.appointment_id)} className="flex items-center justify-between p-3.5">
          <div>
            <p className="text-sm font-semibold text-slate-900">{formatCell(row.appointment_id)}</p>
            <p className="text-xs text-slate-500">{formatCell(row.created_at)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge label={String(row.appointment_type ?? '—')} color={appointmentAgendaBadgeColorMap[String(row.appointment_type)]} />
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
      ))}
    </div>
  );
}
