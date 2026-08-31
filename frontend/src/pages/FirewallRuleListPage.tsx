import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus as PlusIcon } from 'lucide-react';
import type { FirewallRule } from '../types/FirewallRule';
import { firewallRuleService } from '../services/FirewallRuleService';
import { FirewallRuleTable } from '../components/FirewallRule/FirewallRuleTable';
import { SearchInput } from '../components/ui/SearchInput';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { Layers as LayersIcon } from 'lucide-react';

const PAGE_SIZE = 8;
const SEARCHABLE_FIELDS: Array<keyof FirewallRule> = [
  "rule_name",
  "direction",
  "action",
  "protocol",
];

export function FirewallRuleListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<FirewallRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dateFilters, setDateFilters] = useState<Record<string, { from: string; to: string }>>({});

  const [deleteTarget, setDeleteTarget] = useState<FirewallRule | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const data = await firewallRuleService.list();
      setRows(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Firewall Rule records');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const firewall_rule_set_idFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.firewall_rule_set_id ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const directionFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.direction ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const actionFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.action ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const protocolFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.protocol ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    let result = rows;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((row) =>
        SEARCHABLE_FIELDS.some((key) => String(row[key] ?? '').toLowerCase().includes(q)),
      );
    }
    if (filters.firewall_rule_set_id) {
      result = result.filter((row) => String(row.firewall_rule_set_id ?? '') === filters.firewall_rule_set_id);
    }
    if (filters.direction) {
      result = result.filter((row) => String(row.direction ?? '') === filters.direction);
    }
    if (filters.action) {
      result = result.filter((row) => String(row.action ?? '') === filters.action);
    }
    if (filters.protocol) {
      result = result.filter((row) => String(row.protocol ?? '') === filters.protocol);
    }
    if (dateFilters.last_hit_at?.from) {
      result = result.filter((row) => String(row.last_hit_at ?? '') >= dateFilters.last_hit_at!.from);
    }
    if (dateFilters.last_hit_at?.to) {
      result = result.filter((row) => String(row.last_hit_at ?? '') <= dateFilters.last_hit_at!.to);
    }
    if (dateFilters.created_at?.from) {
      result = result.filter((row) => String(row.created_at ?? '') >= dateFilters.created_at!.from);
    }
    if (dateFilters.created_at?.to) {
      result = result.filter((row) => String(row.created_at ?? '') <= dateFilters.created_at!.to);
    }
    return result;
  }, [rows, search, filters, dateFilters]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function openCreate() {
    navigate('/firewall-rules/new');
  }

  function openEdit(row: FirewallRule) {
    navigate(`/firewall-rules/${row.firewall_rule_id}/edit`);
  }

  function openView(row: FirewallRule) {
    navigate(`/firewall-rules/${row.firewall_rule_id}`);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await firewallRuleService.remove(deleteTarget.firewall_rule_id);
      toast.success('Firewall Rule deleted');
      setDeleteTarget(null);
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete record');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Firewall Rules" value={rows.length} icon={LayersIcon} />
        <StatCard label="Matching search" value={filtered.length} icon={LayersIcon} accent="bg-emerald-50 text-emerald-600" />
        <StatCard label="Current page" value={`${currentPage} / ${pageCount}`} icon={LayersIcon} accent="bg-amber-50 text-amber-600" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search firewall rules..." />
        <Button icon={<PlusIcon className="h-4 w-4" />} onClick={openCreate}>
          Add Firewall Rule
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Firewall Rule Set Id</label>
          <select
            value={filters.firewall_rule_set_id ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, firewall_rule_set_id: e.target.value })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Firewall Rule Set Id</option>
            {firewall_rule_set_idFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Direction</label>
          <select
            value={filters.direction ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, direction: e.target.value })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Direction</option>
            {directionFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Action</label>
          <select
            value={filters.action ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, action: e.target.value })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Action</option>
            {actionFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Protocol</label>
          <select
            value={filters.protocol ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, protocol: e.target.value })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Protocol</option>
            {protocolFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Last Hit At from</label>
          <input
            type="date"
            value={dateFilters.last_hit_at?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, last_hit_at: { from: e.target.value, to: f.last_hit_at?.to ?? '' } })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Last Hit At to</label>
          <input
            type="date"
            value={dateFilters.last_hit_at?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, last_hit_at: { from: f.last_hit_at?.from ?? '', to: e.target.value } })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Created At from</label>
          <input
            type="date"
            value={dateFilters.created_at?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, created_at: { from: e.target.value, to: f.created_at?.to ?? '' } })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Created At to</label>
          <input
            type="date"
            value={dateFilters.created_at?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, created_at: { from: f.created_at?.from ?? '', to: e.target.value } })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <button
          type="button"
          onClick={() => { setFilters({});; setDateFilters({});; setPage(1); }}
          className="rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100"
        >
          Clear filters
        </button>
      </div>

      <FirewallRuleTable
        rows={paginated}
        loading={loading}
        onEdit={openEdit}
        onView={openView}
        onDelete={setDeleteTarget}
        onAddNew={openCreate}
      />

      {!loading && filtered.length > 0 && (
        <Pagination
          page={currentPage}
          pageCount={pageCount}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Firewall Rule?"
        description="This action cannot be undone. This will permanently remove the record."
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
