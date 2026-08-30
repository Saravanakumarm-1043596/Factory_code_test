import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus as PlusIcon } from 'lucide-react';
import type { ClaimError } from '../types/ClaimError';
import { claimErrorService } from '../services/ClaimErrorService';
import { ClaimErrorKanban } from '../components/ClaimError/ClaimErrorKanban';
import { SearchInput } from '../components/ui/SearchInput';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { Layers as LayersIcon } from 'lucide-react';

const PAGE_SIZE = 8;
const SEARCHABLE_FIELDS: Array<keyof ClaimError> = [
  "error_category",
  "error_severity",
  "error_description",
  "source_system_origin",
];

export function ClaimErrorListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ClaimError[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dateFilters, setDateFilters] = useState<Record<string, { from: string; to: string }>>({});

  const [deleteTarget, setDeleteTarget] = useState<ClaimError | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const data = await claimErrorService.list();
      setRows(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Claim Error records');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const claim_idFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.claim_id ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const claim_line_idFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.claim_line_id ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const error_categoryFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.error_category ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const error_severityFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.error_severity ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const source_system_originFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.source_system_origin ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const resolution_statusFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.resolution_status ?? '')).filter(Boolean))).sort(),
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
    if (filters.claim_id) {
      result = result.filter((row) => String(row.claim_id ?? '') === filters.claim_id);
    }
    if (filters.claim_line_id) {
      result = result.filter((row) => String(row.claim_line_id ?? '') === filters.claim_line_id);
    }
    if (filters.error_category) {
      result = result.filter((row) => String(row.error_category ?? '') === filters.error_category);
    }
    if (filters.error_severity) {
      result = result.filter((row) => String(row.error_severity ?? '') === filters.error_severity);
    }
    if (filters.source_system_origin) {
      result = result.filter((row) => String(row.source_system_origin ?? '') === filters.source_system_origin);
    }
    if (filters.resolution_status) {
      result = result.filter((row) => String(row.resolution_status ?? '') === filters.resolution_status);
    }
    if (dateFilters.detected_date?.from) {
      result = result.filter((row) => String(row.detected_date ?? '') >= dateFilters.detected_date!.from);
    }
    if (dateFilters.detected_date?.to) {
      result = result.filter((row) => String(row.detected_date ?? '') <= dateFilters.detected_date!.to);
    }
    if (dateFilters.resolved_date?.from) {
      result = result.filter((row) => String(row.resolved_date ?? '') >= dateFilters.resolved_date!.from);
    }
    if (dateFilters.resolved_date?.to) {
      result = result.filter((row) => String(row.resolved_date ?? '') <= dateFilters.resolved_date!.to);
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
    navigate('/claim-errors/new');
  }

  function openEdit(row: ClaimError) {
    navigate(`/claim-errors/${row.claim_error_id}/edit`);
  }

  function openView(row: ClaimError) {
    navigate(`/claim-errors/${row.claim_error_id}`);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await claimErrorService.remove(deleteTarget.claim_error_id);
      toast.success('Claim Error deleted');
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
        <StatCard label="Total Claim Errors" value={rows.length} icon={LayersIcon} />
        <StatCard label="Matching search" value={filtered.length} icon={LayersIcon} accent="bg-emerald-50 text-emerald-600" />
        <StatCard label="Current page" value={`${currentPage} / ${pageCount}`} icon={LayersIcon} accent="bg-amber-50 text-amber-600" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search claim errors..." />
        <Button icon={<PlusIcon className="h-4 w-4" />} onClick={openCreate}>
          Add Claim Error
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Claim Id</label>
          <select
            value={filters.claim_id ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, claim_id: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Claim Id</option>
            {claim_idFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Claim Line Id</label>
          <select
            value={filters.claim_line_id ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, claim_line_id: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Claim Line Id</option>
            {claim_line_idFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Error Category</label>
          <select
            value={filters.error_category ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, error_category: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Error Category</option>
            {error_categoryFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Error Severity</label>
          <select
            value={filters.error_severity ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, error_severity: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Error Severity</option>
            {error_severityFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Source System Origin</label>
          <select
            value={filters.source_system_origin ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, source_system_origin: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Source System Origin</option>
            {source_system_originFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Resolution Status</label>
          <select
            value={filters.resolution_status ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, resolution_status: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Resolution Status</option>
            {resolution_statusFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Detected Date from</label>
          <input
            type="date"
            value={dateFilters.detected_date?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, detected_date: { from: e.target.value, to: f.detected_date?.to ?? '' } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Detected Date to</label>
          <input
            type="date"
            value={dateFilters.detected_date?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, detected_date: { from: f.detected_date?.from ?? '', to: e.target.value } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Resolved Date from</label>
          <input
            type="date"
            value={dateFilters.resolved_date?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, resolved_date: { from: e.target.value, to: f.resolved_date?.to ?? '' } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Resolved Date to</label>
          <input
            type="date"
            value={dateFilters.resolved_date?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, resolved_date: { from: f.resolved_date?.from ?? '', to: e.target.value } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Created At from</label>
          <input
            type="date"
            value={dateFilters.created_at?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, created_at: { from: e.target.value, to: f.created_at?.to ?? '' } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Created At to</label>
          <input
            type="date"
            value={dateFilters.created_at?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, created_at: { from: f.created_at?.from ?? '', to: e.target.value } })); setPage(1); }}
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

      <ClaimErrorKanban
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
        title="Delete Claim Error?"
        description="This action cannot be undone. This will permanently remove the record."
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
