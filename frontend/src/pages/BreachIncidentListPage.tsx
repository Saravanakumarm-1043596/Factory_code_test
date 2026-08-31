import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus as PlusIcon } from 'lucide-react';
import type { BreachIncident } from '../types/BreachIncident';
import { breachIncidentService } from '../services/BreachIncidentService';
import { BreachIncidentKanban } from '../components/BreachIncident/BreachIncidentKanban';
import { SearchInput } from '../components/ui/SearchInput';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { Layers as LayersIcon } from 'lucide-react';

const PAGE_SIZE = 8;
const SEARCHABLE_FIELDS: Array<keyof BreachIncident> = [
  "breach_incident_id",
  "reported_by_user_id",
  "severity",
  "breach_type",
];

export function BreachIncidentListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<BreachIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dateFilters, setDateFilters] = useState<Record<string, { from: string; to: string }>>({});

  const [deleteTarget, setDeleteTarget] = useState<BreachIncident | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const data = await breachIncidentService.list();
      setRows(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Breach Incident records');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const reported_by_user_idFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.reported_by_user_id ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const severityFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.severity ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const breach_typeFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.breach_type ?? '')).filter(Boolean))).sort(),
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
    if (filters.reported_by_user_id) {
      result = result.filter((row) => String(row.reported_by_user_id ?? '') === filters.reported_by_user_id);
    }
    if (filters.severity) {
      result = result.filter((row) => String(row.severity ?? '') === filters.severity);
    }
    if (filters.breach_type) {
      result = result.filter((row) => String(row.breach_type ?? '') === filters.breach_type);
    }
    if (filters.status) {
      result = result.filter((row) => String(row.status ?? '') === filters.status);
    }
    if (dateFilters.discovered_at?.from) {
      result = result.filter((row) => String(row.discovered_at ?? '') >= dateFilters.discovered_at!.from);
    }
    if (dateFilters.discovered_at?.to) {
      result = result.filter((row) => String(row.discovered_at ?? '') <= dateFilters.discovered_at!.to);
    }
    if (dateFilters.reported_at?.from) {
      result = result.filter((row) => String(row.reported_at ?? '') >= dateFilters.reported_at!.from);
    }
    if (dateFilters.reported_at?.to) {
      result = result.filter((row) => String(row.reported_at ?? '') <= dateFilters.reported_at!.to);
    }
    if (dateFilters.hhs_notification_deadline?.from) {
      result = result.filter((row) => String(row.hhs_notification_deadline ?? '') >= dateFilters.hhs_notification_deadline!.from);
    }
    if (dateFilters.hhs_notification_deadline?.to) {
      result = result.filter((row) => String(row.hhs_notification_deadline ?? '') <= dateFilters.hhs_notification_deadline!.to);
    }
    if (dateFilters.hhs_notified_at?.from) {
      result = result.filter((row) => String(row.hhs_notified_at ?? '') >= dateFilters.hhs_notified_at!.from);
    }
    if (dateFilters.hhs_notified_at?.to) {
      result = result.filter((row) => String(row.hhs_notified_at ?? '') <= dateFilters.hhs_notified_at!.to);
    }
    if (dateFilters.patient_notification_sent_at?.from) {
      result = result.filter((row) => String(row.patient_notification_sent_at ?? '') >= dateFilters.patient_notification_sent_at!.from);
    }
    if (dateFilters.patient_notification_sent_at?.to) {
      result = result.filter((row) => String(row.patient_notification_sent_at ?? '') <= dateFilters.patient_notification_sent_at!.to);
    }
    if (dateFilters.resolved_at?.from) {
      result = result.filter((row) => String(row.resolved_at ?? '') >= dateFilters.resolved_at!.from);
    }
    if (dateFilters.resolved_at?.to) {
      result = result.filter((row) => String(row.resolved_at ?? '') <= dateFilters.resolved_at!.to);
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
    navigate('/breach-incidents/new');
  }

  function openEdit(row: BreachIncident) {
    navigate(`/breach-incidents/${row.breach_incident_id}/edit`);
  }

  function openView(row: BreachIncident) {
    navigate(`/breach-incidents/${row.breach_incident_id}`);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await breachIncidentService.remove(deleteTarget.breach_incident_id);
      toast.success('Breach Incident deleted');
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
        <StatCard label="Total Breach Incidents" value={rows.length} icon={LayersIcon} />
        <StatCard label="Matching search" value={filtered.length} icon={LayersIcon} accent="bg-emerald-50 text-emerald-600" />
        <StatCard label="Current page" value={`${currentPage} / ${pageCount}`} icon={LayersIcon} accent="bg-amber-50 text-amber-600" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search breach incidents..." />
        <Button icon={<PlusIcon className="h-4 w-4" />} onClick={openCreate}>
          Add Breach Incident
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Reported By User Id</label>
          <select
            value={filters.reported_by_user_id ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, reported_by_user_id: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Reported By User Id</option>
            {reported_by_user_idFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Severity</label>
          <select
            value={filters.severity ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, severity: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Severity</option>
            {severityFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Breach Type</label>
          <select
            value={filters.breach_type ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, breach_type: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Breach Type</option>
            {breach_typeFilterOptions.map((opt) => (
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
          <label className="text-xs font-medium text-slate-500">Discovered At from</label>
          <input
            type="date"
            value={dateFilters.discovered_at?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, discovered_at: { from: e.target.value, to: f.discovered_at?.to ?? '' } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Discovered At to</label>
          <input
            type="date"
            value={dateFilters.discovered_at?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, discovered_at: { from: f.discovered_at?.from ?? '', to: e.target.value } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Reported At from</label>
          <input
            type="date"
            value={dateFilters.reported_at?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, reported_at: { from: e.target.value, to: f.reported_at?.to ?? '' } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Reported At to</label>
          <input
            type="date"
            value={dateFilters.reported_at?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, reported_at: { from: f.reported_at?.from ?? '', to: e.target.value } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Hhs Notification Deadline from</label>
          <input
            type="date"
            value={dateFilters.hhs_notification_deadline?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, hhs_notification_deadline: { from: e.target.value, to: f.hhs_notification_deadline?.to ?? '' } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Hhs Notification Deadline to</label>
          <input
            type="date"
            value={dateFilters.hhs_notification_deadline?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, hhs_notification_deadline: { from: f.hhs_notification_deadline?.from ?? '', to: e.target.value } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Hhs Notified At from</label>
          <input
            type="date"
            value={dateFilters.hhs_notified_at?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, hhs_notified_at: { from: e.target.value, to: f.hhs_notified_at?.to ?? '' } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Hhs Notified At to</label>
          <input
            type="date"
            value={dateFilters.hhs_notified_at?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, hhs_notified_at: { from: f.hhs_notified_at?.from ?? '', to: e.target.value } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Patient Notification Sent At from</label>
          <input
            type="date"
            value={dateFilters.patient_notification_sent_at?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, patient_notification_sent_at: { from: e.target.value, to: f.patient_notification_sent_at?.to ?? '' } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Patient Notification Sent At to</label>
          <input
            type="date"
            value={dateFilters.patient_notification_sent_at?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, patient_notification_sent_at: { from: f.patient_notification_sent_at?.from ?? '', to: e.target.value } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Resolved At from</label>
          <input
            type="date"
            value={dateFilters.resolved_at?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, resolved_at: { from: e.target.value, to: f.resolved_at?.to ?? '' } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Resolved At to</label>
          <input
            type="date"
            value={dateFilters.resolved_at?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, resolved_at: { from: f.resolved_at?.from ?? '', to: e.target.value } })); setPage(1); }}
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

      <BreachIncidentKanban
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
        title="Delete Breach Incident?"
        description="This action cannot be undone. This will permanently remove the record."
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
