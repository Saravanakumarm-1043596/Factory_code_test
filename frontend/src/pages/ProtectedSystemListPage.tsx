import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus as PlusIcon } from 'lucide-react';
import type { ProtectedSystem } from '../types/ProtectedSystem';
import { protectedSystemService } from '../services/ProtectedSystemService';
import { ProtectedSystemCardGrid } from '../components/ProtectedSystem/ProtectedSystemCardGrid';
import { SearchInput } from '../components/ui/SearchInput';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { Layers as LayersIcon } from 'lucide-react';

const PAGE_SIZE = 8;
const SEARCHABLE_FIELDS: Array<keyof ProtectedSystem> = [
  "name",
  "system_type",
  "environment",
  "data_classification",
];

export function ProtectedSystemListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ProtectedSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dateFilters, setDateFilters] = useState<Record<string, { from: string; to: string }>>({});

  const [deleteTarget, setDeleteTarget] = useState<ProtectedSystem | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const data = await protectedSystemService.list();
      setRows(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Protected System records');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const system_typeFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.system_type ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const environmentFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.environment ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const data_classificationFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.data_classification ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const compliance_scopeFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.compliance_scope ?? '')).filter(Boolean))).sort(),
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
    if (filters.system_type) {
      result = result.filter((row) => String(row.system_type ?? '') === filters.system_type);
    }
    if (filters.environment) {
      result = result.filter((row) => String(row.environment ?? '') === filters.environment);
    }
    if (filters.data_classification) {
      result = result.filter((row) => String(row.data_classification ?? '') === filters.data_classification);
    }
    if (filters.compliance_scope) {
      result = result.filter((row) => String(row.compliance_scope ?? '') === filters.compliance_scope);
    }
    if (dateFilters.last_assessment_date?.from) {
      result = result.filter((row) => String(row.last_assessment_date ?? '') >= dateFilters.last_assessment_date!.from);
    }
    if (dateFilters.last_assessment_date?.to) {
      result = result.filter((row) => String(row.last_assessment_date ?? '') <= dateFilters.last_assessment_date!.to);
    }
    return result;
  }, [rows, search, filters, dateFilters]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function openCreate() {
    navigate('/protected-systems/new');
  }

  function openEdit(row: ProtectedSystem) {
    navigate(`/protected-systems/${row.protected_system_id}/edit`);
  }

  function openView(row: ProtectedSystem) {
    navigate(`/protected-systems/${row.protected_system_id}`);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await protectedSystemService.remove(deleteTarget.protected_system_id);
      toast.success('Protected System deleted');
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
        <StatCard label="Total Protected Systems" value={rows.length} icon={LayersIcon} />
        <StatCard label="Matching search" value={filtered.length} icon={LayersIcon} accent="bg-emerald-50 text-emerald-600" />
        <StatCard label="Current page" value={`${currentPage} / ${pageCount}`} icon={LayersIcon} accent="bg-amber-50 text-amber-600" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search protected systems..." />
        <Button icon={<PlusIcon className="h-4 w-4" />} onClick={openCreate}>
          Add Protected System
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">System Type</label>
          <select
            value={filters.system_type ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, system_type: e.target.value })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All System Type</option>
            {system_typeFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Environment</label>
          <select
            value={filters.environment ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, environment: e.target.value })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Environment</option>
            {environmentFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Data Classification</label>
          <select
            value={filters.data_classification ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, data_classification: e.target.value })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Data Classification</option>
            {data_classificationFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Compliance Scope</label>
          <select
            value={filters.compliance_scope ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, compliance_scope: e.target.value })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Compliance Scope</option>
            {compliance_scopeFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Last Assessment Date from</label>
          <input
            type="date"
            value={dateFilters.last_assessment_date?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, last_assessment_date: { from: e.target.value, to: f.last_assessment_date?.to ?? '' } })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Last Assessment Date to</label>
          <input
            type="date"
            value={dateFilters.last_assessment_date?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, last_assessment_date: { from: f.last_assessment_date?.from ?? '', to: e.target.value } })); setPage(1); }}
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

      <ProtectedSystemCardGrid
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
        title="Delete Protected System?"
        description="This action cannot be undone. This will permanently remove the record."
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
