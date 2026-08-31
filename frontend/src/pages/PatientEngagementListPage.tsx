import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus as PlusIcon } from 'lucide-react';
import type { PatientEngagement } from '../types/PatientEngagement';
import { patientEngagementService } from '../services/PatientEngagementService';
import { PatientEngagementKanban } from '../components/PatientEngagement/PatientEngagementKanban';
import { SearchInput } from '../components/ui/SearchInput';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { Layers as LayersIcon } from 'lucide-react';

const PAGE_SIZE = 8;
const SEARCHABLE_FIELDS: Array<keyof PatientEngagement> = [
  "patient_engagement_id",
  "patient_id",
  "appointment_id",
  "channel",
];

export function PatientEngagementListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<PatientEngagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dateFilters, setDateFilters] = useState<Record<string, { from: string; to: string }>>({});

  const [deleteTarget, setDeleteTarget] = useState<PatientEngagement | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const data = await patientEngagementService.list();
      setRows(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Patient Engagement records');
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

  const appointment_idFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.appointment_id ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const channelFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.channel ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const engagement_typeFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.engagement_type ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const patient_responseFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.patient_response ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const statusFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.status ?? '')).filter(Boolean))).sort(),
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
    if (filters.appointment_id) {
      result = result.filter((row) => String(row.appointment_id ?? '') === filters.appointment_id);
    }
    if (filters.channel) {
      result = result.filter((row) => String(row.channel ?? '') === filters.channel);
    }
    if (filters.engagement_type) {
      result = result.filter((row) => String(row.engagement_type ?? '') === filters.engagement_type);
    }
    if (filters.patient_response) {
      result = result.filter((row) => String(row.patient_response ?? '') === filters.patient_response);
    }
    if (filters.status) {
      result = result.filter((row) => String(row.status ?? '') === filters.status);
    }
    if (dateFilters.sent_at?.from) {
      result = result.filter((row) => String(row.sent_at ?? '') >= dateFilters.sent_at!.from);
    }
    if (dateFilters.sent_at?.to) {
      result = result.filter((row) => String(row.sent_at ?? '') <= dateFilters.sent_at!.to);
    }
    if (dateFilters.delivered_at?.from) {
      result = result.filter((row) => String(row.delivered_at ?? '') >= dateFilters.delivered_at!.from);
    }
    if (dateFilters.delivered_at?.to) {
      result = result.filter((row) => String(row.delivered_at ?? '') <= dateFilters.delivered_at!.to);
    }
    if (dateFilters.response_at?.from) {
      result = result.filter((row) => String(row.response_at ?? '') >= dateFilters.response_at!.from);
    }
    if (dateFilters.response_at?.to) {
      result = result.filter((row) => String(row.response_at ?? '') <= dateFilters.response_at!.to);
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
    navigate('/patient-engagements/new');
  }

  function openEdit(row: PatientEngagement) {
    navigate(`/patient-engagements/${row.patient_engagement_id}/edit`);
  }

  function openView(row: PatientEngagement) {
    navigate(`/patient-engagements/${row.patient_engagement_id}`);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await patientEngagementService.remove(deleteTarget.patient_engagement_id);
      toast.success('Patient Engagement deleted');
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
        <StatCard label="Total Patient Engagements" value={rows.length} icon={LayersIcon} />
        <StatCard label="Matching search" value={filtered.length} icon={LayersIcon} accent="bg-emerald-50 text-emerald-600" />
        <StatCard label="Current page" value={`${currentPage} / ${pageCount}`} icon={LayersIcon} accent="bg-amber-50 text-amber-600" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search patient engagements..." />
        <Button icon={<PlusIcon className="h-4 w-4" />} onClick={openCreate}>
          Add Patient Engagement
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
          <label className="text-xs font-medium text-slate-500">Appointment Id</label>
          <select
            value={filters.appointment_id ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, appointment_id: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Appointment Id</option>
            {appointment_idFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Channel</label>
          <select
            value={filters.channel ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, channel: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Channel</option>
            {channelFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Engagement Type</label>
          <select
            value={filters.engagement_type ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, engagement_type: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Engagement Type</option>
            {engagement_typeFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Patient Response</label>
          <select
            value={filters.patient_response ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, patient_response: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Patient Response</option>
            {patient_responseFilterOptions.map((opt) => (
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
          <label className="text-xs font-medium text-slate-500">Sent At from</label>
          <input
            type="date"
            value={dateFilters.sent_at?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, sent_at: { from: e.target.value, to: f.sent_at?.to ?? '' } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Sent At to</label>
          <input
            type="date"
            value={dateFilters.sent_at?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, sent_at: { from: f.sent_at?.from ?? '', to: e.target.value } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Delivered At from</label>
          <input
            type="date"
            value={dateFilters.delivered_at?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, delivered_at: { from: e.target.value, to: f.delivered_at?.to ?? '' } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Delivered At to</label>
          <input
            type="date"
            value={dateFilters.delivered_at?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, delivered_at: { from: f.delivered_at?.from ?? '', to: e.target.value } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Response At from</label>
          <input
            type="date"
            value={dateFilters.response_at?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, response_at: { from: e.target.value, to: f.response_at?.to ?? '' } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Response At to</label>
          <input
            type="date"
            value={dateFilters.response_at?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, response_at: { from: f.response_at?.from ?? '', to: e.target.value } })); setPage(1); }}
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

      <PatientEngagementKanban
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
        title="Delete Patient Engagement?"
        description="This action cannot be undone. This will permanently remove the record."
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
