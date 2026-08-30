import { useMemo } from 'react';
import { Pencil as PencilIcon, Trash2 as Trash2Icon, Eye as EyeIcon } from 'lucide-react';
import type { PhiAccessLog } from '../../types/PhiAccessLog';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { formatCell } from '../../lib/format';

const phiAccessLogAgendaBadgeColorMap: Record<string, string> = {
  'Member': 'indigo',
  'LabTestOrder': 'emerald',
  'LabTestLine': 'amber',
  'Claim': 'rose',
};

interface PhiAccessLogAgendaProps {
  rows: PhiAccessLog[];
  loading: boolean;
  onEdit: (row: PhiAccessLog) => void;
  onDelete: (row: PhiAccessLog) => void;
  onView: (row: PhiAccessLog) => void;
  onAddNew: () => void;
}

export function PhiAccessLogAgenda({ rows, loading, onEdit, onDelete, onView, onAddNew }: PhiAccessLogAgendaProps) {
  // Computed before the early returns below -- hooks must run unconditionally
  // on every render, so this can't sit after the loading/empty-state checks.
  const sorted = useMemo(
    () => [...rows].sort((a, b) => String(a.access_timestamp ?? '').localeCompare(String(b.access_timestamp ?? ''))),
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
        <div key={String(row.phi_access_log_id)} className="flex items-center justify-between p-3.5">
          <div>
            <p className="text-sm font-semibold text-slate-900">{formatCell(row.ip_address)}</p>
            <p className="text-xs text-slate-500">{formatCell(row.access_timestamp)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge label={String(row.entity_type ?? '—')} color={phiAccessLogAgendaBadgeColorMap[String(row.entity_type)]} />
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
