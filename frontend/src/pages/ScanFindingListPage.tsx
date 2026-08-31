import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus as PlusIcon } from 'lucide-react';
import type { ScanFinding } from '../types/ScanFinding';
import { scanFindingService } from '../services/ScanFindingService';
import { ScanFindingTable } from '../components/ScanFinding/ScanFindingTable';
import { SearchInput } from '../components/ui/SearchInput';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { Layers as LayersIcon } from 'lucide-react';

const PAGE_SIZE = 8;
const SEARCHABLE_FIELDS: Array<keyof ScanFinding> = [
  "finding_type",
  "severity",
  "detail",
  "detected_at",
];

export function ScanFindingListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ScanFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dateFilters, setDateFilters] = useState<Record<string, { from: string; to: string }>>({});

  const [deleteTarget, setDeleteTarget] = useState<ScanFinding | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const data = await scanFindingService.list();
      setRows(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Scan Finding records');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const audit_scan_idFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.audit_scan_id ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const rule_issue_idFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.rule_issue_id ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const firewall_rule_idFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.firewall_rule_id ?? '')).filter(Boolean))).sort(),
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

  const filtered = useMemo(() => {
    let result = rows;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((row) =>
        SEARCHABLE_FIELDS.some((key) => String(row[key] ?? '').toLowerCase().includes(q)),
      );
    }
    if (filters.audit_scan_id) {
      result = result.filter((row) => String(row.audit_scan_id ?? '') === filters.audit_scan_id);
    }
    if (filters.rule_issue_id) {
      result = result.filter((row) => String(row.rule_issue_id ?? '') === filters.rule_issue_id);
    }
    if (filters.firewall_rule_id) {
      result = result.filter((row) => String(row.firewall_rule_id ?? '') === filters.firewall_rule_id);
    }
    if (filters.finding_type) {
      result = result.filter((row) => String(row.finding_type ?? '') === filters.finding_type);
    }
    if (filters.severity) {
      result = result.filter((row) => String(row.severity ?? '') === filters.severity);
    }
    if (dateFilters.detected_at?.from) {
      result = result.filter((row) => String(row.detected_at ?? '') >= dateFilters.detected_at!.from);
    }
    if (dateFilters.detected_at?.to) {
      result = result.filter((row) => String(row.detected_at ?? '') <= dateFilters.detected_at!.to);
    }
    return result;
  }, [rows, search, filters, dateFilters]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function openCreate() {
    navigate('/scan-findings/new');
  }

  function openEdit(row: ScanFinding) {
    navigate(`/scan-findings/${row.scan_finding_id}/edit`);
  }

  function openView(row: ScanFinding) {
    navigate(`/scan-findings/${row.scan_finding_id}`);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await scanFindingService.remove(deleteTarget.scan_finding_id);
      toast.success('Scan Finding deleted');
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
        <StatCard label="Total Scan Findings" value={rows.length} icon={LayersIcon} />
        <StatCard label="Matching search" value={filtered.length} icon={LayersIcon} accent="bg-emerald-50 text-emerald-600" />
        <StatCard label="Current page" value={`${currentPage} / ${pageCount}`} icon={LayersIcon} accent="bg-amber-50 text-amber-600" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search scan findings..." />
        <Button icon={<PlusIcon className="h-4 w-4" />} onClick={openCreate}>
          Add Scan Finding
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Audit Scan Id</label>
          <select
            value={filters.audit_scan_id ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, audit_scan_id: e.target.value })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Audit Scan Id</option>
            {audit_scan_idFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Rule Issue Id</label>
          <select
            value={filters.rule_issue_id ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, rule_issue_id: e.target.value })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Rule Issue Id</option>
            {rule_issue_idFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Firewall Rule Id</label>
          <select
            value={filters.firewall_rule_id ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, firewall_rule_id: e.target.value })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Firewall Rule Id</option>
            {firewall_rule_idFilterOptions.map((opt) => (
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
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
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
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
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
          <label className="text-xs font-medium text-slate-500">Detected At from</label>
          <input
            type="date"
            value={dateFilters.detected_at?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, detected_at: { from: e.target.value, to: f.detected_at?.to ?? '' } })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Detected At to</label>
          <input
            type="date"
            value={dateFilters.detected_at?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, detected_at: { from: f.detected_at?.from ?? '', to: e.target.value } })); setPage(1); }}
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

      <ScanFindingTable
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
        title="Delete Scan Finding?"
        description="This action cannot be undone. This will permanently remove the record."
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
