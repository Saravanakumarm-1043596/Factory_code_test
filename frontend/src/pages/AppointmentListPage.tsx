import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus as PlusIcon } from 'lucide-react';
import type { Appointment } from '../types/Appointment';
import { appointmentService } from '../services/AppointmentService';
import { AppointmentAgenda } from '../components/Appointment/AppointmentAgenda';
import { SearchInput } from '../components/ui/SearchInput';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { Layers as LayersIcon } from 'lucide-react';

const PAGE_SIZE = 8;
const SEARCHABLE_FIELDS: Array<keyof Appointment> = [
  "appointment_id",
  "patient_id",
  "clinician_id",
  "facility_id",
];

export function AppointmentListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dateFilters, setDateFilters] = useState<Record<string, { from: string; to: string }>>({});

  const [deleteTarget, setDeleteTarget] = useState<Appointment | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const data = await appointmentService.list();
      setRows(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Appointment records');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const appointment_idFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.appointment_id ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const patient_idFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.patient_id ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const clinician_idFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.clinician_id ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const facility_idFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.facility_id ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const appointment_typeFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.appointment_type ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const visit_reasonFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.visit_reason ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const statusFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.status ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const ehr_source_systemFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.ehr_source_system ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const ehr_encounter_idFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.ehr_encounter_id ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const cancellation_reasonFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.cancellation_reason ?? '')).filter(Boolean))).sort(),
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
    if (filters.appointment_id) {
      result = result.filter((row) => String(row.appointment_id ?? '') === filters.appointment_id);
    }
    if (filters.patient_id) {
      result = result.filter((row) => String(row.patient_id ?? '') === filters.patient_id);
    }
    if (filters.clinician_id) {
      result = result.filter((row) => String(row.clinician_id ?? '') === filters.clinician_id);
    }
    if (filters.facility_id) {
      result = result.filter((row) => String(row.facility_id ?? '') === filters.facility_id);
    }
    if (filters.appointment_type) {
      result = result.filter((row) => String(row.appointment_type ?? '') === filters.appointment_type);
    }
    if (filters.visit_reason) {
      result = result.filter((row) => String(row.visit_reason ?? '') === filters.visit_reason);
    }
    if (filters.status) {
      result = result.filter((row) => String(row.status ?? '') === filters.status);
    }
    if (filters.ehr_source_system) {
      result = result.filter((row) => String(row.ehr_source_system ?? '') === filters.ehr_source_system);
    }
    if (filters.ehr_encounter_id) {
      result = result.filter((row) => String(row.ehr_encounter_id ?? '') === filters.ehr_encounter_id);
    }
    if (filters.cancellation_reason) {
      result = result.filter((row) => String(row.cancellation_reason ?? '') === filters.cancellation_reason);
    }
    if (dateFilters.scheduled_datetime?.from) {
      result = result.filter((row) => String(row.scheduled_datetime ?? '') >= dateFilters.scheduled_datetime!.from);
    }
    if (dateFilters.scheduled_datetime?.to) {
      result = result.filter((row) => String(row.scheduled_datetime ?? '') <= dateFilters.scheduled_datetime!.to);
    }
    if (dateFilters.predicted_optimal_slot?.from) {
      result = result.filter((row) => String(row.predicted_optimal_slot ?? '') >= dateFilters.predicted_optimal_slot!.from);
    }
    if (dateFilters.predicted_optimal_slot?.to) {
      result = result.filter((row) => String(row.predicted_optimal_slot ?? '') <= dateFilters.predicted_optimal_slot!.to);
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
    navigate('/appointments/new');
  }

  function openEdit(row: Appointment) {
    navigate(`/appointments/${row.appointment_id}/edit`);
  }

  function openView(row: Appointment) {
    navigate(`/appointments/${row.appointment_id}`);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await appointmentService.remove(deleteTarget.appointment_id);
      toast.success('Appointment deleted');
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
        <StatCard label="Total Appointments" value={rows.length} icon={LayersIcon} />
        <StatCard label="Matching search" value={filtered.length} icon={LayersIcon} accent="bg-emerald-50 text-emerald-600" />
        <StatCard label="Current page" value={`${currentPage} / ${pageCount}`} icon={LayersIcon} accent="bg-amber-50 text-amber-600" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search appointments..." />
        <Button icon={<PlusIcon className="h-4 w-4" />} onClick={openCreate}>
          Add Appointment
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
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
          <label className="text-xs font-medium text-slate-500">Clinician Id</label>
          <select
            value={filters.clinician_id ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, clinician_id: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Clinician Id</option>
            {clinician_idFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Facility Id</label>
          <select
            value={filters.facility_id ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, facility_id: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Facility Id</option>
            {facility_idFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Appointment Type</label>
          <select
            value={filters.appointment_type ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, appointment_type: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Appointment Type</option>
            {appointment_typeFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Visit Reason</label>
          <select
            value={filters.visit_reason ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, visit_reason: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Visit Reason</option>
            {visit_reasonFilterOptions.map((opt) => (
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
          <label className="text-xs font-medium text-slate-500">Ehr Encounter Id</label>
          <select
            value={filters.ehr_encounter_id ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, ehr_encounter_id: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Ehr Encounter Id</option>
            {ehr_encounter_idFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Cancellation Reason</label>
          <select
            value={filters.cancellation_reason ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, cancellation_reason: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Cancellation Reason</option>
            {cancellation_reasonFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Scheduled Datetime from</label>
          <input
            type="date"
            value={dateFilters.scheduled_datetime?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, scheduled_datetime: { from: e.target.value, to: f.scheduled_datetime?.to ?? '' } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Scheduled Datetime to</label>
          <input
            type="date"
            value={dateFilters.scheduled_datetime?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, scheduled_datetime: { from: f.scheduled_datetime?.from ?? '', to: e.target.value } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Predicted Optimal Slot from</label>
          <input
            type="date"
            value={dateFilters.predicted_optimal_slot?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, predicted_optimal_slot: { from: e.target.value, to: f.predicted_optimal_slot?.to ?? '' } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Predicted Optimal Slot to</label>
          <input
            type="date"
            value={dateFilters.predicted_optimal_slot?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, predicted_optimal_slot: { from: f.predicted_optimal_slot?.from ?? '', to: e.target.value } })); setPage(1); }}
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

      <AppointmentAgenda
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
        title="Delete Appointment?"
        description="This action cannot be undone. This will permanently remove the record."
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
