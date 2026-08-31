import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus as PlusIcon } from 'lucide-react';
import type { ComplianceMapping } from '../types/ComplianceMapping';
import { complianceMappingService } from '../services/ComplianceMappingService';
import { ComplianceMappingKanban } from '../components/ComplianceMapping/ComplianceMappingKanban';
import { SearchInput } from '../components/ui/SearchInput';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { Layers as LayersIcon } from 'lucide-react';

const PAGE_SIZE = 8;
const SEARCHABLE_FIELDS: Array<keyof ComplianceMapping> = [
  "framework",
  "control_id",
  "control_name",
  "description",
];

export function ComplianceMappingListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ComplianceMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dateFilters, setDateFilters] = useState<Record<string, { from: string; to: string }>>({});

  const [deleteTarget, setDeleteTarget] = useState<ComplianceMapping | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const data = await complianceMappingService.list();
      setRows(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Compliance Mapping records');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const frameworkFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.framework ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const protected_system_idFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.protected_system_id ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const firewall_rule_set_idFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.firewall_rule_set_id ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const compliance_statusFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.compliance_status ?? '')).filter(Boolean))).sort(),
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
    if (filters.framework) {
      result = result.filter((row) => String(row.framework ?? '') === filters.framework);
    }
    if (filters.protected_system_id) {
      result = result.filter((row) => String(row.protected_system_id ?? '') === filters.protected_system_id);
    }
    if (filters.firewall_rule_set_id) {
      result = result.filter((row) => String(row.firewall_rule_set_id ?? '') === filters.firewall_rule_set_id);
    }
    if (filters.compliance_status) {
      result = result.filter((row) => String(row.compliance_status ?? '') === filters.compliance_status);
    }
    if (dateFilters.last_assessed_at?.from) {
      result = result.filter((row) => String(row.last_assessed_at ?? '') >= dateFilters.last_assessed_at!.from);
    }
    if (dateFilters.last_assessed_at?.to) {
      result = result.filter((row) => String(row.last_assessed_at ?? '') <= dateFilters.last_assessed_at!.to);
    }
    return result;
  }, [rows, search, filters, dateFilters]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function openCreate() {
    navigate('/compliance-mappings/new');
  }

  function openEdit(row: ComplianceMapping) {
    navigate(`/compliance-mappings/${row.compliance_mapping_id}/edit`);
  }

  function openView(row: ComplianceMapping) {
    navigate(`/compliance-mappings/${row.compliance_mapping_id}`);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await complianceMappingService.remove(deleteTarget.compliance_mapping_id);
      toast.success('Compliance Mapping deleted');
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Compliance Mappings" value={rows.length} icon={LayersIcon} />
        <StatCard label="Matching search" value={filtered.length} icon={LayersIcon} accent="bg-emerald-50 text-emerald-600" />
        <StatCard label="Current page" value={`${currentPage} / ${pageCount}`} icon={LayersIcon} accent="bg-amber-50 text-amber-600" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search compliance mappings..." />
        <Button icon={<PlusIcon className="h-4 w-4" />} onClick={openCreate}>
          Add Compliance Mapping
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Framework</label>
          <select
            value={filters.framework ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, framework: e.target.value })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Framework</option>
            {frameworkFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Protected System Id</label>
          <select
            value={filters.protected_system_id ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, protected_system_id: e.target.value })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Protected System Id</option>
            {protected_system_idFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Firewall Rule Set Id</label>
          <select
            value={filters.firewall_rule_set_id ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, firewall_rule_set_id: e.target.value })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Firewall Rule Set Id</option>
            {firewall_rule_set_idFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Compliance Status</label>
          <select
            value={filters.compliance_status ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, compliance_status: e.target.value })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Compliance Status</option>
            {compliance_statusFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Last Assessed At from</label>
          <input
            type="date"
            value={dateFilters.last_assessed_at?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, last_assessed_at: { from: e.target.value, to: f.last_assessed_at?.to ?? '' } })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Last Assessed At to</label>
          <input
            type="date"
            value={dateFilters.last_assessed_at?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, last_assessed_at: { from: f.last_assessed_at?.from ?? '', to: e.target.value } })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <button
          type="button"
          onClick={() => { setFilters({});; setDateFilters({});; setPage(1); }}
          className="rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100"
        >
          Clear filters
        </button>
      </div>

      <ComplianceMappingKanban
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
        title="Delete Compliance Mapping?"
        description="This action cannot be undone. This will permanently remove the record."
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
