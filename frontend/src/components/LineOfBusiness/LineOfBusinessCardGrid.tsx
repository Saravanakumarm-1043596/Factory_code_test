import { Pencil as PencilIcon, Trash2 as Trash2Icon, Eye as EyeIcon, Package as PackageIcon } from 'lucide-react';
import type { LineOfBusiness } from '../../types/LineOfBusiness';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { formatCell } from '../../lib/format';

interface LineOfBusinessCardGridProps {
  rows: LineOfBusiness[];
  loading: boolean;
  onEdit: (row: LineOfBusiness) => void;
  onDelete: (row: LineOfBusiness) => void;
  onView: (row: LineOfBusiness) => void;
  onAddNew: () => void;
}

export function LineOfBusinessCardGrid({ rows, loading, onEdit, onDelete, onView, onAddNew }: LineOfBusinessCardGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-md border border-slate-200 bg-white p-3.5 animate-pulse">
            <div className="h-20 rounded-lg bg-slate-100" />
            <div className="mt-3 h-3.5 w-2/3 rounded bg-slate-200" />
            <div className="mt-2 h-3 w-1/3 rounded bg-slate-200" />
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((row) => (
        <div key={String(row.line_of_business_id)} className="flex flex-col rounded-md border border-slate-200 bg-white p-3.5">
          <div className="flex h-20 items-center justify-center rounded-lg bg-brand-50 text-brand-400">
            <PackageIcon className="h-8 w-8" />
          </div>
          <div className="mt-3 flex-1">
            <p className="text-sm font-semibold text-slate-900">{formatCell(row.line_of_business_id)}</p>


            <p className="mt-1 line-clamp-2 text-xs text-slate-500">{formatCell(row.description)}</p>
          </div>
          <div className="mt-3 flex items-center justify-end gap-1 border-t border-slate-100 pt-3">
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
