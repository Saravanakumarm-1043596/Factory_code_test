import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus as PlusIcon } from 'lucide-react';
import type { PhiaccessLog } from '../types/PhiaccessLog';
import { phiaccessLogService } from '../services/PhiaccessLogService';
import { PhiaccessLogTable } from '../components/PhiaccessLog/PhiaccessLogTable';
import { SearchInput } from '../components/ui/SearchInput';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { Layers as LayersIcon } from 'lucide-react';

const PAGE_SIZE = 8;
const SEARCHABLE_FIELDS: Array<keyof PhiaccessLog> = [
  "phi_access_log_id",
  "user_id",
  "patient_id",
  "resource_type",
];

export function PhiaccessLogListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<PhiaccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dateFilters, setDateFilters] = useState<Record<string, { from: string; to: string }>>({});

  const [deleteTarget, setDeleteTarget] = useState<PhiaccessLog | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const data = await phiaccessLogService.list();
      setRows(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Phiaccess Log records');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const user_idFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.user_id ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const patient_idFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.patient_id ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const resource_typeFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.resource_type ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const actionFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.action ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const access_reasonFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.access_reason ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const ehr_source_systemFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.ehr_source_system ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const denial_reasonFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.denial_reason ?? '')).filter(Boolean))).sort(),
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
    if (filters.user_id) {
      result = result.filter((row) => String(row.user_id ?? '') === filters.user_id);
    }
    if (filters.patient_id) {
      result = result.filter((row) => String(row.patient_id ?? '') === filters.patient_id);
    }
    if (filters.resource_type) {
      result = result.filter((row) => String(row.resource_type ?? '') === filters.resource_type);
    }
    if (filters.action) {
      result = result.filter((row) => String(row.action ?? '') === filters.action);
    }
    if (filters.access_reason) {
      result = result.filter((row) => String(row.access_reason ?? '') === filters.access_reason);
    }
    if (filters.ehr_source_system) {
      result = result.filter((row) => String(row.ehr_source_system ?? '') === filters.ehr_source_system);
    }
    if (filters.denial_reason) {
      result = result.filter((row) => String(row.denial_reason ?? '') === filters.denial_reason);
    }
    if (dateFilters.accessed_at?.from) {
      result = result.filter((row) => String(row.accessed_at ?? '') >= dateFilters.accessed_at!.from);
    }
    if (dateFilters.accessed_at?.to) {
      result = result.filter((row) => String(row.accessed_at ?? '') <= dateFilters.accessed_at!.to);
    }
    return result;
  }, [rows, search, filters, dateFilters]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function openCreate() {
    navigate('/phiaccess-logs/new');
  }

  function openEdit(row: PhiaccessLog) {
    navigate(`/phiaccess-logs/${row.phi_access_log_id}/edit`);
  }

  function openView(row: PhiaccessLog) {
    navigate(`/phiaccess-logs/${row.phi_access_log_id}`);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await phiaccessLogService.remove(deleteTarget.phi_access_log_id);
      toast.success('Phiaccess Log deleted');
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Phiaccess Logs" value={rows.length} icon={LayersIcon} />
        <StatCard label="Matching search" value={filtered.length} icon={LayersIcon} accent="bg-emerald-50 text-emerald-600" />
        <StatCard label="Current page" value={`${currentPage} / ${pageCount}`} icon={LayersIcon} accent="bg-amber-50 text-amber-600" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search phiaccess logs..." />
        <Button icon={<PlusIcon className="h-4 w-4" />} onClick={openCreate}>
          Add Phiaccess Log
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">User Id</label>
          <select
            value={filters.user_id ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, user_id: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All User Id</option>
            {user_idFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Patient Id</label>
          <select
            value={filters.patient_id ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, patient_id: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Patient Id</option>
            {patient_idFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Resource Type</label>
          <select
            value={filters.resource_type ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, resource_type: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Resource Type</option>
            {resource_typeFilterOptions.map((opt) => (
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
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
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
          <label className="text-xs font-medium text-slate-500">Access Reason</label>
          <select
            value={filters.access_reason ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, access_reason: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Access Reason</option>
            {access_reasonFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Ehr Source System</label>
          <select
            value={filters.ehr_source_system ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, ehr_source_system: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Ehr Source System</option>
            {ehr_source_systemFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Denial Reason</label>
          <select
            value={filters.denial_reason ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, denial_reason: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Denial Reason</option>
            {denial_reasonFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Accessed At from</label>
          <input
            type="date"
            value={dateFilters.accessed_at?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, accessed_at: { from: e.target.value, to: f.accessed_at?.to ?? '' } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Accessed At to</label>
          <input
            type="date"
            value={dateFilters.accessed_at?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, accessed_at: { from: f.accessed_at?.from ?? '', to: e.target.value } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <button
          type="button"
          onClick={() => { setFilters({});; setDateFilters({});; setPage(1); }}
          className="rounded-sm px-2.5 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100"
        >
          Clear filters
        </button>
      </div>

      <PhiaccessLogTable
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
        title="Delete Phiaccess Log?"
        description="This action cannot be undone. This will permanently remove the record."
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
