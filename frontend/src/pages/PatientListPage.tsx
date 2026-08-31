import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus as PlusIcon } from 'lucide-react';
import type { Patient } from '../types/Patient';
import { patientService } from '../services/PatientService';
import { PatientDirectory } from '../components/Patient/PatientDirectory';
import { SearchInput } from '../components/ui/SearchInput';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { Layers as LayersIcon } from 'lucide-react';

const PAGE_SIZE = 8;
const SEARCHABLE_FIELDS: Array<keyof Patient> = [
  "patient_id",
  "first_name",
  "last_name",
  "date_of_birth",
];

export function PatientListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dateFilters, setDateFilters] = useState<Record<string, { from: string; to: string }>>({});

  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const data = await patientService.list();
      setRows(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Patient records');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const genderFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.gender ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const preferred_contact_methodFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.preferred_contact_method ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const preferred_languageFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.preferred_language ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const membership_statusFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.membership_status ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const ehr_source_systemFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.ehr_source_system ?? '')).filter(Boolean))).sort(),
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
    if (filters.gender) {
      result = result.filter((row) => String(row.gender ?? '') === filters.gender);
    }
    if (filters.preferred_contact_method) {
      result = result.filter((row) => String(row.preferred_contact_method ?? '') === filters.preferred_contact_method);
    }
    if (filters.preferred_language) {
      result = result.filter((row) => String(row.preferred_language ?? '') === filters.preferred_language);
    }
    if (filters.membership_status) {
      result = result.filter((row) => String(row.membership_status ?? '') === filters.membership_status);
    }
    if (filters.ehr_source_system) {
      result = result.filter((row) => String(row.ehr_source_system ?? '') === filters.ehr_source_system);
    }
    if (dateFilters.date_of_birth?.from) {
      result = result.filter((row) => String(row.date_of_birth ?? '') >= dateFilters.date_of_birth!.from);
    }
    if (dateFilters.date_of_birth?.to) {
      result = result.filter((row) => String(row.date_of_birth ?? '') <= dateFilters.date_of_birth!.to);
    }
    if (dateFilters.risk_score_updated_at?.from) {
      result = result.filter((row) => String(row.risk_score_updated_at ?? '') >= dateFilters.risk_score_updated_at!.from);
    }
    if (dateFilters.risk_score_updated_at?.to) {
      result = result.filter((row) => String(row.risk_score_updated_at ?? '') <= dateFilters.risk_score_updated_at!.to);
    }
    if (dateFilters.enrollment_date?.from) {
      result = result.filter((row) => String(row.enrollment_date ?? '') >= dateFilters.enrollment_date!.from);
    }
    if (dateFilters.enrollment_date?.to) {
      result = result.filter((row) => String(row.enrollment_date ?? '') <= dateFilters.enrollment_date!.to);
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
    navigate('/patients/new');
  }

  function openEdit(row: Patient) {
    navigate(`/patients/${row.patient_id}/edit`);
  }

  function openView(row: Patient) {
    navigate(`/patients/${row.patient_id}`);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await patientService.remove(deleteTarget.patient_id);
      toast.success('Patient deleted');
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
        <StatCard label="Total Patients" value={rows.length} icon={LayersIcon} />
        <StatCard label="Matching search" value={filtered.length} icon={LayersIcon} accent="bg-emerald-50 text-emerald-600" />
        <StatCard label="Current page" value={`${currentPage} / ${pageCount}`} icon={LayersIcon} accent="bg-amber-50 text-amber-600" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search patients..." />
        <Button icon={<PlusIcon className="h-4 w-4" />} onClick={openCreate}>
          Add Patient
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Gender</label>
          <select
            value={filters.gender ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, gender: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Gender</option>
            {genderFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Preferred Contact Method</label>
          <select
            value={filters.preferred_contact_method ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, preferred_contact_method: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Preferred Contact Method</option>
            {preferred_contact_methodFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Preferred Language</label>
          <select
            value={filters.preferred_language ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, preferred_language: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Preferred Language</option>
            {preferred_languageFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Membership Status</label>
          <select
            value={filters.membership_status ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, membership_status: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Membership Status</option>
            {membership_statusFilterOptions.map((opt) => (
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
          <label className="text-xs font-medium text-slate-500">Date Of Birth from</label>
          <input
            type="date"
            value={dateFilters.date_of_birth?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, date_of_birth: { from: e.target.value, to: f.date_of_birth?.to ?? '' } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Date Of Birth to</label>
          <input
            type="date"
            value={dateFilters.date_of_birth?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, date_of_birth: { from: f.date_of_birth?.from ?? '', to: e.target.value } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Risk Score Updated At from</label>
          <input
            type="date"
            value={dateFilters.risk_score_updated_at?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, risk_score_updated_at: { from: e.target.value, to: f.risk_score_updated_at?.to ?? '' } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Risk Score Updated At to</label>
          <input
            type="date"
            value={dateFilters.risk_score_updated_at?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, risk_score_updated_at: { from: f.risk_score_updated_at?.from ?? '', to: e.target.value } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Enrollment Date from</label>
          <input
            type="date"
            value={dateFilters.enrollment_date?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, enrollment_date: { from: e.target.value, to: f.enrollment_date?.to ?? '' } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Enrollment Date to</label>
          <input
            type="date"
            value={dateFilters.enrollment_date?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, enrollment_date: { from: f.enrollment_date?.from ?? '', to: e.target.value } })); setPage(1); }}
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

      <PatientDirectory
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
        title="Delete Patient?"
        description="This action cannot be undone. This will permanently remove the record."
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
