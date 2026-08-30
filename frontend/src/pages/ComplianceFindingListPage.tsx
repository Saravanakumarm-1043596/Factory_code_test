import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus as PlusIcon } from 'lucide-react';
import type { ComplianceFinding } from '../types/ComplianceFinding';
import { complianceFindingService } from '../services/ComplianceFindingService';
import { ComplianceFindingKanban } from '../components/ComplianceFinding/ComplianceFindingKanban';
import { SearchInput } from '../components/ui/SearchInput';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { Layers as LayersIcon } from 'lucide-react';

const PAGE_SIZE = 8;
const SEARCHABLE_FIELDS: Array<keyof ComplianceFinding> = [
  "finding_type",
  "severity",
  "description",
  "affected_system",
];

export function ComplianceFindingListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ComplianceFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dateFilters, setDateFilters] = useState<Record<string, { from: string; to: string }>>({});

  const [deleteTarget, setDeleteTarget] = useState<ComplianceFinding | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const data = await complianceFindingService.list();
      setRows(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Compliance Finding records');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const compliance_control_idFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.compliance_control_id ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const finding_typeFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.finding_type ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const severityFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.severity ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const affected_systemFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.affected_system ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const affected_line_of_business_idFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.affected_line_of_business_id ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const statusFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.status ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const remediation_planFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.remediation_plan ?? '')).filter(Boolean))).sort(),
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
    if (filters.compliance_control_id) {
      result = result.filter((row) => String(row.compliance_control_id ?? '') === filters.compliance_control_id);
    }
    if (filters.finding_type) {
      result = result.filter((row) => String(row.finding_type ?? '') === filters.finding_type);
    }
    if (filters.severity) {
      result = result.filter((row) => String(row.severity ?? '') === filters.severity);
    }
    if (filters.affected_system) {
      result = result.filter((row) => String(row.affected_system ?? '') === filters.affected_system);
    }
    if (filters.affected_line_of_business_id) {
      result = result.filter((row) => String(row.affected_line_of_business_id ?? '') === filters.affected_line_of_business_id);
    }
    if (filters.status) {
      result = result.filter((row) => String(row.status ?? '') === filters.status);
    }
    if (filters.remediation_plan) {
      result = result.filter((row) => String(row.remediation_plan ?? '') === filters.remediation_plan);
    }
    if (dateFilters.due_date?.from) {
      result = result.filter((row) => String(row.due_date ?? '') >= dateFilters.due_date!.from);
    }
    if (dateFilters.due_date?.to) {
      result = result.filter((row) => String(row.due_date ?? '') <= dateFilters.due_date!.to);
    }
    if (dateFilters.found_date?.from) {
      result = result.filter((row) => String(row.found_date ?? '') >= dateFilters.found_date!.from);
    }
    if (dateFilters.found_date?.to) {
      result = result.filter((row) => String(row.found_date ?? '') <= dateFilters.found_date!.to);
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
    navigate('/compliance-findings/new');
  }

  function openEdit(row: ComplianceFinding) {
    navigate(`/compliance-findings/${row.compliance_finding_id}/edit`);
  }

  function openView(row: ComplianceFinding) {
    navigate(`/compliance-findings/${row.compliance_finding_id}`);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await complianceFindingService.remove(deleteTarget.compliance_finding_id);
      toast.success('Compliance Finding deleted');
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
        <StatCard label="Total Compliance Findings" value={rows.length} icon={LayersIcon} />
        <StatCard label="Matching search" value={filtered.length} icon={LayersIcon} accent="bg-emerald-50 text-emerald-600" />
        <StatCard label="Current page" value={`${currentPage} / ${pageCount}`} icon={LayersIcon} accent="bg-amber-50 text-amber-600" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search compliance findings..." />
        <Button icon={<PlusIcon className="h-4 w-4" />} onClick={openCreate}>
          Add Compliance Finding
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Compliance Control Id</label>
          <select
            value={filters.compliance_control_id ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, compliance_control_id: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Compliance Control Id</option>
            {compliance_control_idFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Finding Type</label>
          <select
            value={filters.finding_type ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, finding_type: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Finding Type</option>
            {finding_typeFilterOptions.map((opt) => (
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
          <label className="text-xs font-medium text-slate-500">Affected System</label>
          <select
            value={filters.affected_system ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, affected_system: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Affected System</option>
            {affected_systemFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Affected Line Of Business Id</label>
          <select
            value={filters.affected_line_of_business_id ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, affected_line_of_business_id: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Affected Line Of Business Id</option>
            {affected_line_of_business_idFilterOptions.map((opt) => (
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
          <label className="text-xs font-medium text-slate-500">Remediation Plan</label>
          <select
            value={filters.remediation_plan ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, remediation_plan: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Remediation Plan</option>
            {remediation_planFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Due Date from</label>
          <input
            type="date"
            value={dateFilters.due_date?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, due_date: { from: e.target.value, to: f.due_date?.to ?? '' } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Due Date to</label>
          <input
            type="date"
            value={dateFilters.due_date?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, due_date: { from: f.due_date?.from ?? '', to: e.target.value } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Found Date from</label>
          <input
            type="date"
            value={dateFilters.found_date?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, found_date: { from: e.target.value, to: f.found_date?.to ?? '' } })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Found Date to</label>
          <input
            type="date"
            value={dateFilters.found_date?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, found_date: { from: f.found_date?.from ?? '', to: e.target.value } })); setPage(1); }}
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

      <ComplianceFindingKanban
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
        title="Delete Compliance Finding?"
        description="This action cannot be undone. This will permanently remove the record."
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
