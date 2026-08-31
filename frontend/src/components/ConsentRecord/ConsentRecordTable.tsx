import { Pencil as PencilIcon, Trash2 as Trash2Icon, Eye as EyeIcon } from 'lucide-react';
import type { ConsentRecord } from '../../types/ConsentRecord';
import { Badge } from '../ui/Badge';
import { TableSkeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { formatCell } from '../../lib/format';

const consentRecordBadgeColorMap: Record<string, string> = {
  'General Treatment': 'indigo',
  'SMS Communication': 'emerald',
  'Email Communication': 'amber',
  'Data Sharing': 'rose',
  'Research': 'sky',
  'Telehealth': 'violet',
};

interface ConsentRecordTableProps {
  rows: ConsentRecord[];
  loading: boolean;
  onEdit: (row: ConsentRecord) => void;
  onDelete: (row: ConsentRecord) => void;
  onView: (row: ConsentRecord) => void;
  onAddNew: () => void;
}

const COLUMNS: Array<{ key: keyof ConsentRecord; label: string }> = [
  { key: "consent_record_id", label: "Consent Record Id" },
  { key: "patient_id", label: "Patient Id" },
  { key: "consent_type", label: "Consent Type" },
  { key: "status", label: "Status" },
  { key: "granted_at", label: "Granted At" },
  { key: "expires_at", label: "Expires At" },
  { key: "revoked_at", label: "Revoked At" },
  { key: "collected_by_user_id", label: "Collected By User Id" },
  { key: "consent_document", label: "Consent Document" },
  { key: "notes", label: "Notes" },
  { key: "created_at", label: "Created At" },
  { key: "updated_at", label: "Updated At" },
];

export function ConsentRecordTable({ rows, loading, onEdit, onDelete, onView, onAddNew }: ConsentRecordTableProps) {
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
            <tr key={String(row.consent_record_id)} className="hover:bg-slate-50">
              {COLUMNS.map((col) => (
                <td key={String(col.key)} className="whitespace-nowrap px-3 py-2.5 sm:px-4 text-sm text-slate-700">
                  {col.key === 'consent_type' ? (
                    <Badge label={String(row[col.key] ?? '—')} color={consentRecordBadgeColorMap[String(row[col.key])]} />
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
