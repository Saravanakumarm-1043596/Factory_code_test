import { Pencil as PencilIcon, Trash2 as Trash2Icon, Eye as EyeIcon } from 'lucide-react';
import type { ClaimLine } from '../../types/ClaimLine';
import { Badge } from '../ui/Badge';
import { TableSkeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { formatCell } from '../../lib/format';

const claimLineBadgeColorMap: Record<string, string> = {
  'Approved': 'indigo',
  'Denied': 'emerald',
  'Pended': 'amber',
  'Adjusted': 'rose',
};

interface ClaimLineTableProps {
  rows: ClaimLine[];
  loading: boolean;
  onEdit: (row: ClaimLine) => void;
  onDelete: (row: ClaimLine) => void;
  onView: (row: ClaimLine) => void;
  onAddNew: () => void;
}

const COLUMNS: Array<{ key: keyof ClaimLine; label: string }> = [
  { key: "claim_line_id", label: "Claim Line Id" },
  { key: "claim_id", label: "Claim Id" },
  { key: "line_number", label: "Line Number" },
  { key: "cpt_code", label: "Cpt Code" },
  { key: "modifier", label: "Modifier" },
  { key: "icd10_pointer", label: "Icd10 Pointer" },
  { key: "units", label: "Units" },
  { key: "billed_amount", label: "Billed Amount" },
  { key: "allowed_amount", label: "Allowed Amount" },
  { key: "paid_amount", label: "Paid Amount" },
  { key: "line_status", label: "Line Status" },
  { key: "denial_reason_code", label: "Denial Reason Code" },
  { key: "lab_test_line_id", label: "Lab Test Line Id" },
  { key: "created_at", label: "Created At" },
];

export function ClaimLineTable({ rows, loading, onEdit, onDelete, onView, onAddNew }: ClaimLineTableProps) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <TableSkeleton columns={COLUMNS.length + 1} />
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
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={String(col.key)}
                scope="col"
                className="px-3 py-2.5 sm:px-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {col.label}
              </th>
            ))}
            <th scope="col" className="px-3 py-2.5 sm:px-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row) => (
            <tr key={String(row.claim_line_id)} className="hover:bg-slate-50">
              {COLUMNS.map((col) => (
                <td key={String(col.key)} className="whitespace-nowrap px-3 py-2.5 sm:px-4 text-sm text-slate-700">
                  {col.key === 'line_status' ? (
                    <Badge label={String(row[col.key] ?? '—')} color={claimLineBadgeColorMap[String(row[col.key])]} />
                  ) : (
                    formatCell(row[col.key])
                  )}
                </td>
              ))}
              <td className="whitespace-nowrap px-3 py-2.5 sm:px-4 text-right text-sm">
                <div className="flex items-center justify-end gap-1">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
