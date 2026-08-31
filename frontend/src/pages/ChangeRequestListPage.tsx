import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus as PlusIcon } from 'lucide-react';
import type { ChangeRequest } from '../types/ChangeRequest';
import { changeRequestService } from '../services/ChangeRequestService';
import { ChangeRequestKanban } from '../components/ChangeRequest/ChangeRequestKanban';
import { SearchInput } from '../components/ui/SearchInput';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { Layers as LayersIcon } from 'lucide-react';

const PAGE_SIZE = 8;
const SEARCHABLE_FIELDS: Array<keyof ChangeRequest> = [
  "title",
  "description",
  "change_type",
  "status",
];

export function ChangeRequestListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dateFilters, setDateFilters] = useState<Record<string, { from: string; to: string }>>({});

  const [deleteTarget, setDeleteTarget] = useState<ChangeRequest | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const data = await changeRequestService.list();
      setRows(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Change Request records');
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

  const change_typeFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.change_type ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const statusFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.status ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const priorityFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.priority ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const rule_issue_idFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.rule_issue_id ?? '')).filter(Boolean))).sort(),
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
    if (filters.change_type) {
      result = result.filter((row) => String(row.change_type ?? '') === filters.change_type);
    }
    if (filters.status) {
      result = result.filter((row) => String(row.status ?? '') === filters.status);
    }
    if (filters.priority) {
      result = result.filter((row) => String(row.priority ?? '') === filters.priority);
    }
    if (filters.rule_issue_id) {
      result = result.filter((row) => String(row.rule_issue_id ?? '') === filters.rule_issue_id);
    }
    if (dateFilters.submitted_at?.from) {
      result = result.filter((row) => String(row.submitted_at ?? '') >= dateFilters.submitted_at!.from);
    }
    if (dateFilters.submitted_at?.to) {
      result = result.filter((row) => String(row.submitted_at ?? '') <= dateFilters.submitted_at!.to);
    }
    if (dateFilters.approved_at?.from) {
      result = result.filter((row) => String(row.approved_at ?? '') >= dateFilters.approved_at!.from);
    }
    if (dateFilters.approved_at?.to) {
      result = result.filter((row) => String(row.approved_at ?? '') <= dateFilters.approved_at!.to);
    }
    if (dateFilters.implemented_at?.from) {
      result = result.filter((row) => String(row.implemented_at ?? '') >= dateFilters.implemented_at!.from);
    }
    if (dateFilters.implemented_at?.to) {
      result = result.filter((row) => String(row.implemented_at ?? '') <= dateFilters.implemented_at!.to);
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
    navigate('/change-requests/new');
  }

  function openEdit(row: ChangeRequest) {
    navigate(`/change-requests/${row.change_request_id}/edit`);
  }

  function openView(row: ChangeRequest) {
    navigate(`/change-requests/${row.change_request_id}`);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await changeRequestService.remove(deleteTarget.change_request_id);
      toast.success('Change Request deleted');
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
        <StatCard label="Total Change Requests" value={rows.length} icon={LayersIcon} />
        <StatCard label="Matching search" value={filtered.length} icon={LayersIcon} accent="bg-emerald-50 text-emerald-600" />
        <StatCard label="Current page" value={`${currentPage} / ${pageCount}`} icon={LayersIcon} accent="bg-amber-50 text-amber-600" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search change requests..." />
        <Button icon={<PlusIcon className="h-4 w-4" />} onClick={openCreate}>
          Add Change Request
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
          <label className="text-xs font-medium text-slate-500">Change Type</label>
          <select
            value={filters.change_type ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, change_type: e.target.value })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Change Type</option>
            {change_typeFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Status</label>
          <select
            value={filters.status ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, status: e.target.value })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Status</option>
            {statusFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Priority</label>
          <select
            value={filters.priority ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, priority: e.target.value })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Priority</option>
            {priorityFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Rule Issue Id</label>
          <select
            value={filters.rule_issue_id ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, rule_issue_id: e.target.value })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Rule Issue Id</option>
            {rule_issue_idFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Submitted At from</label>
          <input
            type="date"
            value={dateFilters.submitted_at?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, submitted_at: { from: e.target.value, to: f.submitted_at?.to ?? '' } })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Submitted At to</label>
          <input
            type="date"
            value={dateFilters.submitted_at?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, submitted_at: { from: f.submitted_at?.from ?? '', to: e.target.value } })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Approved At from</label>
          <input
            type="date"
            value={dateFilters.approved_at?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, approved_at: { from: e.target.value, to: f.approved_at?.to ?? '' } })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Approved At to</label>
          <input
            type="date"
            value={dateFilters.approved_at?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, approved_at: { from: f.approved_at?.from ?? '', to: e.target.value } })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Implemented At from</label>
          <input
            type="date"
            value={dateFilters.implemented_at?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, implemented_at: { from: e.target.value, to: f.implemented_at?.to ?? '' } })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Implemented At to</label>
          <input
            type="date"
            value={dateFilters.implemented_at?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, implemented_at: { from: f.implemented_at?.from ?? '', to: e.target.value } })); setPage(1); }}
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

      <ChangeRequestKanban
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
        title="Delete Change Request?"
        description="This action cannot be undone. This will permanently remove the record."
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
