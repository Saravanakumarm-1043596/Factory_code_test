import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus as PlusIcon } from 'lucide-react';
import type { Claim } from '../types/Claim';
import { claimService } from '../services/ClaimService';
import { ClaimKanban } from '../components/Claim/ClaimKanban';
import { SearchInput } from '../components/ui/SearchInput';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { Layers as LayersIcon } from 'lucide-react';

const PAGE_SIZE = 8;
const SEARCHABLE_FIELDS: Array<keyof Claim> = [
  "claim_number",
  "source_system",
  "claim_type",
  "claim_status",
];

export function ClaimListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dateFilters, setDateFilters] = useState<Record<string, { from: string; to: string }>>({});

  const [deleteTarget, setDeleteTarget] = useState<Claim | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const data = await claimService.list();
      setRows(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Claim records');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const lab_test_order_idFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.lab_test_order_id ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const member_idFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.member_id ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const rendering_provider_idFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.rendering_provider_id ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const line_of_business_idFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.line_of_business_id ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const source_systemFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.source_system ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const claim_typeFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.claim_type ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const claim_statusFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.claim_status ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const denial_reason_codeFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.denial_reason_code ?? '')).filter(Boolean))).sort(),
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
    if (filters.lab_test_order_id) {
      result = result.filter((row) => String(row.lab_test_order_id ?? '') === filters.lab_test_order_id);
    }
    if (filters.member_id) {
      result = result.filter((row) => String(row.member_id ?? '') === filters.member_id);
    }
    if (filters.rendering_provider_id) {
      result = result.filter((row) => String(row.rendering_provider_id ?? '') === filters.rendering_provider_id);
    }
    if (filters.line_of_business_id) {
      result = result.filter((row) => String(row.line_of_business_id ?? '') === filters.line_of_business_id);
    }
    if (filters.source_system) {
      result = result.filter((row) => String(row.source_system ?? '') === filters.source_system);
    }
    if (filters.claim_type) {
      result = result.filter((row) => String(row.claim_type ?? '') === filters.claim_type);
    }
    if (filters.claim_status) {
      result = result.filter((row) => String(row.claim_status ?? '') === filters.claim_status);
    }
    if (filters.denial_reason_code) {
      result = result.filter((row) => String(row.denial_reason_code ?? '') === filters.denial_reason_code);
    }
    if (dateFilters.service_date?.from) {
      result = result.filter((row) => String(row.service_date ?? '') >= dateFilters.service_date!.from);
    }
    if (dateFilters.service_date?.to) {
      result = result.filter((row) => String(row.service_date ?? '') <= dateFilters.service_date!.to);
    }
    if (dateFilters.submitted_date?.from) {
      result = result.filter((row) => String(row.submitted_date ?? '') >= dateFilters.submitted_date!.from);
    }
    if (dateFilters.submitted_date?.to) {
      result = result.filter((row) => String(row.submitted_date ?? '') <= dateFilters.submitted_date!.to);
    }
    if (dateFilters.adjudicated_date?.from) {
      result = result.filter((row) => String(row.adjudicated_date ?? '') >= dateFilters.adjudicated_date!.from);
    }
    if (dateFilters.adjudicated_date?.to) {
      result = result.filter((row) => String(row.adjudicated_date ?? '') <= dateFilters.adjudicated_date!.to);
    }
    if (dateFilters.created_at?.from) {
      result = result.filter((row) => String(row.created_at ?? '') >= dateFilters.created_at!.from);
    }
    if (dateFilters.created_at?.to) {
      result = result.filter((row) => String(row.created_at ?? '') <= dateFilters.created_at!.to);
    }
    if (dateFilters.updated_at?.from) {
      result = result.filter((row) => String(row.updated_at ?? '') >= dateFilters.updated_at!.from);
    }
    if (dateFilters.updated_at?.to) {
      result = result.filter((row) => String(row.updated_at ?? '') <= dateFilters.updated_at!.to);
    }
    return result;
  }, [rows, search, filters, dateFilters]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function openCreate() {
    navigate('/claims/new');
  }

  function openEdit(row: Claim) {
    navigate(`/claims/${row.claim_id}/edit`);
  }

  function openView(row: Claim) {
    navigate(`/claims/${row.claim_id}`);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await claimService.remove(deleteTarget.claim_id);
      toast.success('Claim deleted');
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
        <StatCard label="Total Claims" value={rows.length} icon={LayersIcon} />
        <StatCard label="Matching search" value={filtered.length} icon={LayersIcon} accent="bg-emerald-50 text-emerald-600" />
        <StatCard label="Current page" value={`${currentPage} / ${pageCount}`} icon={LayersIcon} accent="bg-amber-50 text-amber-600" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search claims..." />
        <Button icon={<PlusIcon className="h-4 w-4" />} onClick={openCreate}>
          Add Claim
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Lab Test Order Id</label>
          <select
            value={filters.lab_test_order_id ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, lab_test_order_id: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Lab Test Order Id</option>
            {lab_test_order_idFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Member Id</label>
          <select
            value={filters.member_id ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, member_id: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Member Id</option>
            {member_idFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Rendering Provider Id</label>
          <select
            value={filters.rendering_provider_id ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, rendering_provider_id: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Rendering Provider Id</option>
            {rendering_provider_idFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Line Of Business Id</label>
          <select
            value={filters.line_of_business_id ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, line_of_business_id: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Line Of Business Id</option>
            {line_of_business_idFilterOptions.map((opt) => (
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
          <label className="text-xs font-medium text-slate-500">Claim Type</label>
          <select
            value={filters.claim_type ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, claim_type: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Claim Type</option>
            {claim_typeFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Claim Status</label>
          <select
            value={filters.claim_status ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, claim_status: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Claim Status</option>
            {claim_statusFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Denial Reason Code</label>
          <select
            value={filters.denial_reason_code ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, denial_reason_code: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Denial Reason Code</option>
            {denial_reason_codeFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Service Date from</label>
          <input
            type="date"
            value={dateFilters.service_date?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, service_date: { from: e.target.value, to: f.service_date?.to ?? '' } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Service Date to</label>
          <input
            type="date"
            value={dateFilters.service_date?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, service_date: { from: f.service_date?.from ?? '', to: e.target.value } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Submitted Date from</label>
          <input
            type="date"
            value={dateFilters.submitted_date?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, submitted_date: { from: e.target.value, to: f.submitted_date?.to ?? '' } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Submitted Date to</label>
          <input
            type="date"
            value={dateFilters.submitted_date?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, submitted_date: { from: f.submitted_date?.from ?? '', to: e.target.value } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Adjudicated Date from</label>
          <input
            type="date"
            value={dateFilters.adjudicated_date?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, adjudicated_date: { from: e.target.value, to: f.adjudicated_date?.to ?? '' } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Adjudicated Date to</label>
          <input
            type="date"
            value={dateFilters.adjudicated_date?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, adjudicated_date: { from: f.adjudicated_date?.from ?? '', to: e.target.value } })); setPage(1); }}
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
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Updated At from</label>
          <input
            type="date"
            value={dateFilters.updated_at?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, updated_at: { from: e.target.value, to: f.updated_at?.to ?? '' } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Updated At to</label>
          <input
            type="date"
            value={dateFilters.updated_at?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, updated_at: { from: f.updated_at?.from ?? '', to: e.target.value } })); setPage(1); }}
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

      <ClaimKanban
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
        title="Delete Claim?"
        description="This action cannot be undone. This will permanently remove the record."
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
