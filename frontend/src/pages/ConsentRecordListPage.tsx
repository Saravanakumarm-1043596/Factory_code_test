import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus as PlusIcon } from 'lucide-react';
import type { ConsentRecord } from '../types/ConsentRecord';
import { consentRecordService } from '../services/ConsentRecordService';
import { ConsentRecordTable } from '../components/ConsentRecord/ConsentRecordTable';
import { SearchInput } from '../components/ui/SearchInput';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { Layers as LayersIcon } from 'lucide-react';

const PAGE_SIZE = 8;
const SEARCHABLE_FIELDS: Array<keyof ConsentRecord> = [
  "consent_record_id",
  "patient_id",
  "consent_type",
  "status",
];

export function ConsentRecordListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dateFilters, setDateFilters] = useState<Record<string, { from: string; to: string }>>({});

  const [deleteTarget, setDeleteTarget] = useState<ConsentRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const data = await consentRecordService.list();
      setRows(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Consent Record records');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const patient_idFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.patient_id ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const consent_typeFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.consent_type ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const statusFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.status ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const collected_by_user_idFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.collected_by_user_id ?? '')).filter(Boolean))).sort(),
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
    if (filters.patient_id) {
      result = result.filter((row) => String(row.patient_id ?? '') === filters.patient_id);
    }
    if (filters.consent_type) {
      result = result.filter((row) => String(row.consent_type ?? '') === filters.consent_type);
    }
    if (filters.status) {
      result = result.filter((row) => String(row.status ?? '') === filters.status);
    }
    if (filters.collected_by_user_id) {
      result = result.filter((row) => String(row.collected_by_user_id ?? '') === filters.collected_by_user_id);
    }
    if (dateFilters.granted_at?.from) {
      result = result.filter((row) => String(row.granted_at ?? '') >= dateFilters.granted_at!.from);
    }
    if (dateFilters.granted_at?.to) {
      result = result.filter((row) => String(row.granted_at ?? '') <= dateFilters.granted_at!.to);
    }
    if (dateFilters.expires_at?.from) {
      result = result.filter((row) => String(row.expires_at ?? '') >= dateFilters.expires_at!.from);
    }
    if (dateFilters.expires_at?.to) {
      result = result.filter((row) => String(row.expires_at ?? '') <= dateFilters.expires_at!.to);
    }
    if (dateFilters.revoked_at?.from) {
      result = result.filter((row) => String(row.revoked_at ?? '') >= dateFilters.revoked_at!.from);
    }
    if (dateFilters.revoked_at?.to) {
      result = result.filter((row) => String(row.revoked_at ?? '') <= dateFilters.revoked_at!.to);
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
    navigate('/consent-records/new');
  }

  function openEdit(row: ConsentRecord) {
    navigate(`/consent-records/${row.consent_record_id}/edit`);
  }

  function openView(row: ConsentRecord) {
    navigate(`/consent-records/${row.consent_record_id}`);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await consentRecordService.remove(deleteTarget.consent_record_id);
      toast.success('Consent Record deleted');
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
        <StatCard label="Total Consent Records" value={rows.length} icon={LayersIcon} />
        <StatCard label="Matching search" value={filtered.length} icon={LayersIcon} accent="bg-emerald-50 text-emerald-600" />
        <StatCard label="Current page" value={`${currentPage} / ${pageCount}`} icon={LayersIcon} accent="bg-amber-50 text-amber-600" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search consent records..." />
        <Button icon={<PlusIcon className="h-4 w-4" />} onClick={openCreate}>
          Add Consent Record
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
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
          <label className="text-xs font-medium text-slate-500">Consent Type</label>
          <select
            value={filters.consent_type ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, consent_type: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Consent Type</option>
            {consent_typeFilterOptions.map((opt) => (
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
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
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
          <label className="text-xs font-medium text-slate-500">Collected By User Id</label>
          <select
            value={filters.collected_by_user_id ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, collected_by_user_id: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Collected By User Id</option>
            {collected_by_user_idFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Granted At from</label>
          <input
            type="date"
            value={dateFilters.granted_at?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, granted_at: { from: e.target.value, to: f.granted_at?.to ?? '' } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Granted At to</label>
          <input
            type="date"
            value={dateFilters.granted_at?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, granted_at: { from: f.granted_at?.from ?? '', to: e.target.value } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Expires At from</label>
          <input
            type="date"
            value={dateFilters.expires_at?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, expires_at: { from: e.target.value, to: f.expires_at?.to ?? '' } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Expires At to</label>
          <input
            type="date"
            value={dateFilters.expires_at?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, expires_at: { from: f.expires_at?.from ?? '', to: e.target.value } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Revoked At from</label>
          <input
            type="date"
            value={dateFilters.revoked_at?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, revoked_at: { from: e.target.value, to: f.revoked_at?.to ?? '' } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Revoked At to</label>
          <input
            type="date"
            value={dateFilters.revoked_at?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, revoked_at: { from: f.revoked_at?.from ?? '', to: e.target.value } })); setPage(1); }}
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

      <ConsentRecordTable
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
        title="Delete Consent Record?"
        description="This action cannot be undone. This will permanently remove the record."
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
