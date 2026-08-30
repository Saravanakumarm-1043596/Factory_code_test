import { Pencil as PencilIcon, Trash2 as Trash2Icon, Eye as EyeIcon } from 'lucide-react';
import type { LabTestOrder } from '../../types/LabTestOrder';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { formatCell } from '../../lib/format';

const KANBAN_BADGE_COLOR_MAP: Record<string, string> = {
  'Ordered': 'indigo',
  'Specimen Collected': 'emerald',
  'In Progress': 'amber',
  'Resulted': 'rose',
  'Cancelled': 'sky',
  'On Hold': 'violet',
};

interface LabTestOrderKanbanProps {
  rows: LabTestOrder[];
  loading: boolean;
  onEdit: (row: LabTestOrder) => void;
  onDelete: (row: LabTestOrder) => void;
  onView: (row: LabTestOrder) => void;
  onAddNew: () => void;
}

const KANBAN_STAGES: string[] = ['Ordered', 'Specimen Collected', 'In Progress', 'Resulted', 'Cancelled', 'On Hold'];

export function LabTestOrderKanban({ rows, loading, onEdit, onDelete, onView, onAddNew }: LabTestOrderKanbanProps) {
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

  const stages = KANBAN_STAGES.length > 0 ? KANBAN_STAGES : Array.from(new Set(rows.map((row) => String(row.order_status))));

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {stages.map((stage) => {
        const stageRows = rows.filter((row) => String(row.order_status) === stage);
        return (
          <div key={stage} className="flex w-72 flex-none flex-col rounded-md border border-slate-200 bg-white p-3.5">
            <div className="flex items-center justify-between">
              <Badge label={stage} color={KANBAN_BADGE_COLOR_MAP[stage]} />
              <span className="text-xs font-medium text-slate-400">{stageRows.length}</span>
            </div>
            <div className="mt-3 flex flex-1 flex-col gap-2">
              {stageRows.map((row) => (
                <div key={String(row.lab_test_order_id)} className="rounded-sm border border-slate-200 bg-white p-3">
                  <p className="text-sm font-medium text-slate-900">{formatCell(row.order_number)}</p>
                  <div className="mt-2 flex items-center justify-end gap-1">
                    <button onClick={() => onView(row)} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="View">
                      <EyeIcon className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => onEdit(row)} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-brand-600" aria-label="Edit">
                      <PencilIcon className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => onDelete(row)} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600" aria-label="Delete">
                      <Trash2Icon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {stageRows.length === 0 && <p className="text-xs text-slate-400">No records</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
