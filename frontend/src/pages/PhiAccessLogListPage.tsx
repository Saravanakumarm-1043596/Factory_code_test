import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus as PlusIcon } from 'lucide-react';
import type { PhiAccessLog } from '../types/PhiAccessLog';
import { phiAccessLogService } from '../services/PhiAccessLogService';
import { PhiAccessLogAgenda } from '../components/PhiAccessLog/PhiAccessLogAgenda';
import { SearchInput } from '../components/ui/SearchInput';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { Layers as LayersIcon } from 'lucide-react';

const PAGE_SIZE = 8;
const SEARCHABLE_FIELDS: Array<keyof PhiAccessLog> = [
  "entity_type",
  "access_type",
  "source_system",
  "access_reason",
];

export function PhiAccessLogListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<PhiAccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dateFilters, setDateFilters] = useState<Record<string, { from: string; to: string }>>({});

  const [deleteTarget, setDeleteTarget] = useState<PhiAccessLog | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const data = await phiAccessLogService.list();
      setRows(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Phi Access Log records');
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

  const entity_typeFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.entity_type ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const access_typeFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.access_type ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const source_systemFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.source_system ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const access_reasonFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.access_reason ?? '')).filter(Boolean))).sort(),
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
    if (filters.entity_type) {
      result = result.filter((row) => String(row.entity_type ?? '') === filters.entity_type);
    }
    if (filters.access_type) {
      result = result.filter((row) => String(row.access_type ?? '') === filters.access_type);
    }
    if (filters.source_system) {
      result = result.filter((row) => String(row.source_system ?? '') === filters.source_system);
    }
    if (filters.access_reason) {
      result = result.filter((row) => String(row.access_reason ?? '') === filters.access_reason);
    }
    if (dateFilters.access_timestamp?.from) {
      result = result.filter((row) => String(row.access_timestamp ?? '') >= dateFilters.access_timestamp!.from);
    }
    if (dateFilters.access_timestamp?.to) {
      result = result.filter((row) => String(row.access_timestamp ?? '') <= dateFilters.access_timestamp!.to);
    }
    return result;
  }, [rows, search, filters, dateFilters]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function openCreate() {
    navigate('/phi-access-logs/new');
  }

  function openEdit(row: PhiAccessLog) {
    navigate(`/phi-access-logs/${row.phi_access_log_id}/edit`);
  }

  function openView(row: PhiAccessLog) {
    navigate(`/phi-access-logs/${row.phi_access_log_id}`);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await phiAccessLogService.remove(deleteTarget.phi_access_log_id);
      toast.success('Phi Access Log deleted');
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
        <StatCard label="Total Phi Access Logs" value={rows.length} icon={LayersIcon} />
        <StatCard label="Matching search" value={filtered.length} icon={LayersIcon} accent="bg-emerald-50 text-emerald-600" />
        <StatCard label="Current page" value={`${currentPage} / ${pageCount}`} icon={LayersIcon} accent="bg-amber-50 text-amber-600" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search phi access logs..." />
        <Button icon={<PlusIcon className="h-4 w-4" />} onClick={openCreate}>
          Add Phi Access Log
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
          <label className="text-xs font-medium text-slate-500">Entity Type</label>
          <select
            value={filters.entity_type ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, entity_type: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Entity Type</option>
            {entity_typeFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Access Type</label>
          <select
            value={filters.access_type ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, access_type: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Access Type</option>
            {access_typeFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Source System</label>
          <select
            value={filters.source_system ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, source_system: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Source System</option>
            {source_systemFilterOptions.map((opt) => (
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
          <label className="text-xs font-medium text-slate-500">Access Timestamp from</label>
          <input
            type="date"
            value={dateFilters.access_timestamp?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, access_timestamp: { from: e.target.value, to: f.access_timestamp?.to ?? '' } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Access Timestamp to</label>
          <input
            type="date"
            value={dateFilters.access_timestamp?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, access_timestamp: { from: f.access_timestamp?.from ?? '', to: e.target.value } })); setPage(1); }}
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

      <PhiAccessLogAgenda
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
        title="Delete Phi Access Log?"
        description="This action cannot be undone. This will permanently remove the record."
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
