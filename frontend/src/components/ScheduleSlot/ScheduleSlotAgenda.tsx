import { useMemo } from 'react';
import { Pencil as PencilIcon, Trash2 as Trash2Icon, Eye as EyeIcon } from 'lucide-react';
import type { ScheduleSlot } from '../../types/ScheduleSlot';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { formatCell } from '../../lib/format';

const scheduleSlotAgendaBadgeColorMap: Record<string, string> = {
  'Standard': 'indigo',
  'Overbook': 'emerald',
  'Walk-In': 'amber',
  'Telehealth Only': 'rose',
  'Blocked': 'sky',
};

interface ScheduleSlotAgendaProps {
  rows: ScheduleSlot[];
  loading: boolean;
  onEdit: (row: ScheduleSlot) => void;
  onDelete: (row: ScheduleSlot) => void;
  onView: (row: ScheduleSlot) => void;
  onAddNew: () => void;
}

export function ScheduleSlotAgenda({ rows, loading, onEdit, onDelete, onView, onAddNew }: ScheduleSlotAgendaProps) {
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
        <div key={String(row.schedule_slot_id)} className="flex items-center justify-between p-3.5">
          <div>
            <p className="text-sm font-semibold text-slate-900">{formatCell(row.schedule_slot_id)}</p>
            <p className="text-xs text-slate-500">{formatCell(row.created_at)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge label={String(row.slot_type ?? '—')} color={scheduleSlotAgendaBadgeColorMap[String(row.slot_type)]} />
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
