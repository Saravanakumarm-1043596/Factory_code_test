import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus as PlusIcon } from 'lucide-react';
import type { EhrintegrationEvent } from '../types/EhrintegrationEvent';
import { ehrintegrationEventService } from '../services/EhrintegrationEventService';
import { EhrintegrationEventKanban } from '../components/EhrintegrationEvent/EhrintegrationEventKanban';
import { SearchInput } from '../components/ui/SearchInput';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { Layers as LayersIcon } from 'lucide-react';

const PAGE_SIZE = 8;
const SEARCHABLE_FIELDS: Array<keyof EhrintegrationEvent> = [
  "ehr_integration_event_id",
  "source_system",
  "direction",
  "event_type",
];

export function EhrintegrationEventListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<EhrintegrationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dateFilters, setDateFilters] = useState<Record<string, { from: string; to: string }>>({});

  const [deleteTarget, setDeleteTarget] = useState<EhrintegrationEvent | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const data = await ehrintegrationEventService.list();
      setRows(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Ehrintegration Event records');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const source_systemFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.source_system ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const directionFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.direction ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const event_typeFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.event_type ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const patient_idFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.patient_id ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const appointment_idFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.appointment_id ?? '')).filter(Boolean))).sort(),
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
    if (filters.source_system) {
      result = result.filter((row) => String(row.source_system ?? '') === filters.source_system);
    }
    if (filters.direction) {
      result = result.filter((row) => String(row.direction ?? '') === filters.direction);
    }
    if (filters.event_type) {
      result = result.filter((row) => String(row.event_type ?? '') === filters.event_type);
    }
    if (filters.patient_id) {
      result = result.filter((row) => String(row.patient_id ?? '') === filters.patient_id);
    }
    if (filters.appointment_id) {
      result = result.filter((row) => String(row.appointment_id ?? '') === filters.appointment_id);
    }
    if (filters.status) {
      result = result.filter((row) => String(row.status ?? '') === filters.status);
    }
    if (dateFilters.occurred_at?.from) {
      result = result.filter((row) => String(row.occurred_at ?? '') >= dateFilters.occurred_at!.from);
    }
    if (dateFilters.occurred_at?.to) {
      result = result.filter((row) => String(row.occurred_at ?? '') <= dateFilters.occurred_at!.to);
    }
    if (dateFilters.processed_at?.from) {
      result = result.filter((row) => String(row.processed_at ?? '') >= dateFilters.processed_at!.from);
    }
    if (dateFilters.processed_at?.to) {
      result = result.filter((row) => String(row.processed_at ?? '') <= dateFilters.processed_at!.to);
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
    navigate('/ehrintegration-events/new');
  }

  function openEdit(row: EhrintegrationEvent) {
    navigate(`/ehrintegration-events/${row.ehr_integration_event_id}/edit`);
  }

  function openView(row: EhrintegrationEvent) {
    navigate(`/ehrintegration-events/${row.ehr_integration_event_id}`);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await ehrintegrationEventService.remove(deleteTarget.ehr_integration_event_id);
      toast.success('Ehrintegration Event deleted');
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
        <StatCard label="Total Ehrintegration Events" value={rows.length} icon={LayersIcon} />
        <StatCard label="Matching search" value={filtered.length} icon={LayersIcon} accent="bg-emerald-50 text-emerald-600" />
        <StatCard label="Current page" value={`${currentPage} / ${pageCount}`} icon={LayersIcon} accent="bg-amber-50 text-amber-600" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search ehrintegration events..." />
        <Button icon={<PlusIcon className="h-4 w-4" />} onClick={openCreate}>
          Add Ehrintegration Event
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
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
          <label className="text-xs font-medium text-slate-500">Direction</label>
          <select
            value={filters.direction ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, direction: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Direction</option>
            {directionFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Event Type</label>
          <select
            value={filters.event_type ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, event_type: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Event Type</option>
            {event_typeFilterOptions.map((opt) => (
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
          <label className="text-xs font-medium text-slate-500">Occurred At from</label>
          <input
            type="date"
            value={dateFilters.occurred_at?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, occurred_at: { from: e.target.value, to: f.occurred_at?.to ?? '' } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Occurred At to</label>
          <input
            type="date"
            value={dateFilters.occurred_at?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, occurred_at: { from: f.occurred_at?.from ?? '', to: e.target.value } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Processed At from</label>
          <input
            type="date"
            value={dateFilters.processed_at?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, processed_at: { from: e.target.value, to: f.processed_at?.to ?? '' } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Processed At to</label>
          <input
            type="date"
            value={dateFilters.processed_at?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, processed_at: { from: f.processed_at?.from ?? '', to: e.target.value } })); setPage(1); }}
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

      <EhrintegrationEventKanban
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
        title="Delete Ehrintegration Event?"
        description="This action cannot be undone. This will permanently remove the record."
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
