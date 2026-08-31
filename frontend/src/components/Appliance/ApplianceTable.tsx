import { Pencil as PencilIcon, Trash2 as Trash2Icon, Eye as EyeIcon } from 'lucide-react';
import type { Appliance } from '../../types/Appliance';
import { Badge } from '../ui/Badge';
import { TableSkeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { formatCell } from '../../lib/format';

const applianceBadgeColorMap: Record<string, string> = {
  'Palo Alto': 'indigo',
  'Fortinet': 'emerald',
  'Azure Firewall': 'amber',
  'F5': 'rose',
  'Other': 'sky',
};

interface ApplianceTableProps {
  rows: Appliance[];
  loading: boolean;
  onEdit: (row: Appliance) => void;
  onDelete: (row: Appliance) => void;
  onView: (row: Appliance) => void;
  onAddNew: () => void;
}

const COLUMNS: Array<{ key: keyof Appliance; label: string }> = [
  { key: "appliance_id", label: "Appliance Id" },
  { key: "name", label: "Name" },
  { key: "appliance_type", label: "Appliance Type" },
  { key: "ip_address", label: "Ip Address" },
  { key: "hostname", label: "Hostname" },
  { key: "environment", label: "Environment" },
  { key: "firmware_version", label: "Firmware Version" },
  { key: "total_rule_count", label: "Total Rule Count" },
  { key: "last_synced_at", label: "Last Synced At" },
  { key: "notes", label: "Notes" },
];

export function ApplianceTable({ rows, loading, onEdit, onDelete, onView, onAddNew }: ApplianceTableProps) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <TableSkeleton columns={COLUMNS.length + 1} />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <EmptyState
          title="No records yet"
          description="Get started by creating your first record."
          action={
            <button
              onClick={onAddNew}
              className="mt-2 rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-500"
            >
              Add new
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={String(col.key)}
                scope="col"
                className="px-4 py-3.5 sm:px-6 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {col.label}
              </th>
            ))}
            <th scope="col" className="px-4 py-3.5 sm:px-6 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row) => (
            <tr key={String(row.appliance_id)} className="hover:bg-slate-50">
              {COLUMNS.map((col) => (
                <td key={String(col.key)} className="whitespace-nowrap px-4 py-3.5 sm:px-6 text-sm text-slate-700">
                  {col.key === 'appliance_type' ? (
                    <Badge label={String(row[col.key] ?? '—')} color={applianceBadgeColorMap[String(row[col.key])]} />
                  ) : (
                    formatCell(row[col.key])
                  )}
                </td>
              ))}
              <td className="whitespace-nowrap px-4 py-3.5 sm:px-6 text-right text-sm">
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => onView(row)} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="View">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button onClick={() => onEdit(row)} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600" aria-label="Edit">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button onClick={() => onDelete(row)} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600" aria-label="Delete">
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
