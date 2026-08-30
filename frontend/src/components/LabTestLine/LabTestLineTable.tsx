import { Pencil as PencilIcon, Trash2 as Trash2Icon, Eye as EyeIcon } from 'lucide-react';
import type { LabTestLine } from '../../types/LabTestLine';
import { Badge } from '../ui/Badge';
import { TableSkeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { formatCell } from '../../lib/format';

const labTestLineBadgeColorMap: Record<string, string> = {
  'Chemistry': 'indigo',
  'Hematology': 'emerald',
  'Microbiology': 'amber',
  'Pathology': 'rose',
  'Genetic': 'sky',
  'Immunology': 'violet',
  'Toxicology': 'slate',
  'Other': 'teal',
};

interface LabTestLineTableProps {
  rows: LabTestLine[];
  loading: boolean;
  onEdit: (row: LabTestLine) => void;
  onDelete: (row: LabTestLine) => void;
  onView: (row: LabTestLine) => void;
  onAddNew: () => void;
}

const COLUMNS: Array<{ key: keyof LabTestLine; label: string }> = [
  { key: "lab_test_line_id", label: "Lab Test Line Id" },
  { key: "lab_test_order_id", label: "Lab Test Order Id" },
  { key: "cpt_code", label: "Cpt Code" },
  { key: "test_name", label: "Test Name" },
  { key: "loinc_code", label: "Loinc Code" },
  { key: "test_category", label: "Test Category" },
  { key: "result_value", label: "Result Value" },
  { key: "result_unit", label: "Result Unit" },
  { key: "reference_range", label: "Reference Range" },
  { key: "abnormal_flag", label: "Abnormal Flag" },
  { key: "line_status", label: "Line Status" },
  { key: "result_date", label: "Result Date" },
  { key: "created_at", label: "Created At" },
];

export function LabTestLineTable({ rows, loading, onEdit, onDelete, onView, onAddNew }: LabTestLineTableProps) {
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
            <tr key={String(row.lab_test_line_id)} className="hover:bg-slate-50">
              {COLUMNS.map((col) => (
                <td key={String(col.key)} className="whitespace-nowrap px-3 py-2.5 sm:px-4 text-sm text-slate-700">
                  {col.key === 'test_category' ? (
                    <Badge label={String(row[col.key] ?? '—')} color={labTestLineBadgeColorMap[String(row[col.key])]} />
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
