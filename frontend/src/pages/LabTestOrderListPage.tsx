import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus as PlusIcon } from 'lucide-react';
import type { LabTestOrder } from '../types/LabTestOrder';
import { labTestOrderService } from '../services/LabTestOrderService';
import { LabTestOrderKanban } from '../components/LabTestOrder/LabTestOrderKanban';
import { SearchInput } from '../components/ui/SearchInput';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { Layers as LayersIcon } from 'lucide-react';

const PAGE_SIZE = 8;
const SEARCHABLE_FIELDS: Array<keyof LabTestOrder> = [
  "order_number",
  "source_system",
  "order_status",
  "priority",
];

export function LabTestOrderListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<LabTestOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dateFilters, setDateFilters] = useState<Record<string, { from: string; to: string }>>({});

  const [deleteTarget, setDeleteTarget] = useState<LabTestOrder | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const data = await labTestOrderService.list();
      setRows(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Lab Test Order records');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const member_idFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.member_id ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const ordering_provider_idFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.ordering_provider_id ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const performing_lab_idFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.performing_lab_id ?? '')).filter(Boolean))).sort(),
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

  const order_statusFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.order_status ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const priorityFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.priority ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const prior_auth_numberFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.prior_auth_number ?? '')).filter(Boolean))).sort(),
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
    if (filters.member_id) {
      result = result.filter((row) => String(row.member_id ?? '') === filters.member_id);
    }
    if (filters.ordering_provider_id) {
      result = result.filter((row) => String(row.ordering_provider_id ?? '') === filters.ordering_provider_id);
    }
    if (filters.performing_lab_id) {
      result = result.filter((row) => String(row.performing_lab_id ?? '') === filters.performing_lab_id);
    }
    if (filters.line_of_business_id) {
      result = result.filter((row) => String(row.line_of_business_id ?? '') === filters.line_of_business_id);
    }
    if (filters.source_system) {
      result = result.filter((row) => String(row.source_system ?? '') === filters.source_system);
    }
    if (filters.order_status) {
      result = result.filter((row) => String(row.order_status ?? '') === filters.order_status);
    }
    if (filters.priority) {
      result = result.filter((row) => String(row.priority ?? '') === filters.priority);
    }
    if (filters.prior_auth_number) {
      result = result.filter((row) => String(row.prior_auth_number ?? '') === filters.prior_auth_number);
    }
    if (dateFilters.order_date?.from) {
      result = result.filter((row) => String(row.order_date ?? '') >= dateFilters.order_date!.from);
    }
    if (dateFilters.order_date?.to) {
      result = result.filter((row) => String(row.order_date ?? '') <= dateFilters.order_date!.to);
    }
    if (dateFilters.specimen_collection_date?.from) {
      result = result.filter((row) => String(row.specimen_collection_date ?? '') >= dateFilters.specimen_collection_date!.from);
    }
    if (dateFilters.specimen_collection_date?.to) {
      result = result.filter((row) => String(row.specimen_collection_date ?? '') <= dateFilters.specimen_collection_date!.to);
    }
    if (dateFilters.result_date?.from) {
      result = result.filter((row) => String(row.result_date ?? '') >= dateFilters.result_date!.from);
    }
    if (dateFilters.result_date?.to) {
      result = result.filter((row) => String(row.result_date ?? '') <= dateFilters.result_date!.to);
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
    navigate('/lab-test-orders/new');
  }

  function openEdit(row: LabTestOrder) {
    navigate(`/lab-test-orders/${row.lab_test_order_id}/edit`);
  }

  function openView(row: LabTestOrder) {
    navigate(`/lab-test-orders/${row.lab_test_order_id}`);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await labTestOrderService.remove(deleteTarget.lab_test_order_id);
      toast.success('Lab Test Order deleted');
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
        <StatCard label="Total Lab Test Orders" value={rows.length} icon={LayersIcon} />
        <StatCard label="Matching search" value={filtered.length} icon={LayersIcon} accent="bg-emerald-50 text-emerald-600" />
        <StatCard label="Current page" value={`${currentPage} / ${pageCount}`} icon={LayersIcon} accent="bg-amber-50 text-amber-600" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search lab test orders..." />
        <Button icon={<PlusIcon className="h-4 w-4" />} onClick={openCreate}>
          Add Lab Test Order
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
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
          <label className="text-xs font-medium text-slate-500">Ordering Provider Id</label>
          <select
            value={filters.ordering_provider_id ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, ordering_provider_id: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Ordering Provider Id</option>
            {ordering_provider_idFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Performing Lab Id</label>
          <select
            value={filters.performing_lab_id ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, performing_lab_id: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Performing Lab Id</option>
            {performing_lab_idFilterOptions.map((opt) => (
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
          <label className="text-xs font-medium text-slate-500">Order Status</label>
          <select
            value={filters.order_status ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, order_status: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Order Status</option>
            {order_statusFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Priority</label>
          <select
            value={filters.priority ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, priority: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Priority</option>
            {priorityFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Prior Auth Number</label>
          <select
            value={filters.prior_auth_number ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, prior_auth_number: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Prior Auth Number</option>
            {prior_auth_numberFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Order Date from</label>
          <input
            type="date"
            value={dateFilters.order_date?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, order_date: { from: e.target.value, to: f.order_date?.to ?? '' } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Order Date to</label>
          <input
            type="date"
            value={dateFilters.order_date?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, order_date: { from: f.order_date?.from ?? '', to: e.target.value } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Specimen Collection Date from</label>
          <input
            type="date"
            value={dateFilters.specimen_collection_date?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, specimen_collection_date: { from: e.target.value, to: f.specimen_collection_date?.to ?? '' } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Specimen Collection Date to</label>
          <input
            type="date"
            value={dateFilters.specimen_collection_date?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, specimen_collection_date: { from: f.specimen_collection_date?.from ?? '', to: e.target.value } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Result Date from</label>
          <input
            type="date"
            value={dateFilters.result_date?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, result_date: { from: e.target.value, to: f.result_date?.to ?? '' } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Result Date to</label>
          <input
            type="date"
            value={dateFilters.result_date?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, result_date: { from: f.result_date?.from ?? '', to: e.target.value } })); setPage(1); }}
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

      <LabTestOrderKanban
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
        title="Delete Lab Test Order?"
        description="This action cannot be undone. This will permanently remove the record."
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
