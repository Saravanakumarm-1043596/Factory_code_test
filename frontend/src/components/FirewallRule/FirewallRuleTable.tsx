import { Pencil as PencilIcon, Trash2 as Trash2Icon, Eye as EyeIcon } from 'lucide-react';
import type { FirewallRule } from '../../types/FirewallRule';
import { Badge } from '../ui/Badge';
import { TableSkeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { formatCell } from '../../lib/format';

const firewallRuleBadgeColorMap: Record<string, string> = {
  'Low': 'indigo',
  'Medium': 'emerald',
  'High': 'amber',
  'Critical': 'rose',
};

interface FirewallRuleTableProps {
  rows: FirewallRule[];
  loading: boolean;
  onEdit: (row: FirewallRule) => void;
  onDelete: (row: FirewallRule) => void;
  onView: (row: FirewallRule) => void;
  onAddNew: () => void;
}

const COLUMNS: Array<{ key: keyof FirewallRule; label: string }> = [
  { key: "firewall_rule_id", label: "Firewall Rule Id" },
  { key: "firewall_rule_set_id", label: "Firewall Rule Set Id" },
  { key: "rule_name", label: "Rule Name" },
  { key: "priority", label: "Priority" },
  { key: "direction", label: "Direction" },
  { key: "action", label: "Action" },
  { key: "protocol", label: "Protocol" },
  { key: "source_address", label: "Source Address" },
  { key: "source_port_range", label: "Source Port Range" },
  { key: "destination_address", label: "Destination Address" },
  { key: "destination_port_range", label: "Destination Port Range" },
  { key: "is_enabled", label: "Is Enabled" },
  { key: "description", label: "Description" },
  { key: "last_hit_at", label: "Last Hit At" },
  { key: "hit_count", label: "Hit Count" },
  { key: "created_at", label: "Created At" },
];

export function FirewallRuleTable({ rows, loading, onEdit, onDelete, onView, onAddNew }: FirewallRuleTableProps) {
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
            <tr key={String(row.firewall_rule_id)} className="hover:bg-slate-50">
              {COLUMNS.map((col) => (
                <td key={String(col.key)} className="whitespace-nowrap px-4 py-3.5 sm:px-6 text-sm text-slate-700">
                  {col.key === 'priority' ? (
                    <Badge label={String(row[col.key] ?? '—')} color={firewallRuleBadgeColorMap[String(row[col.key])]} />
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
