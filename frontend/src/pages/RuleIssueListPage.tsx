import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus as PlusIcon } from 'lucide-react';
import type { RuleIssue } from '../types/RuleIssue';
import { ruleIssueService } from '../services/RuleIssueService';
import { RuleIssueKanban } from '../components/RuleIssue/RuleIssueKanban';
import { SearchInput } from '../components/ui/SearchInput';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { Layers as LayersIcon } from 'lucide-react';

const PAGE_SIZE = 8;
const SEARCHABLE_FIELDS: Array<keyof RuleIssue> = [
  "issue_type",
  "severity",
  "status",
  "description",
];

export function RuleIssueListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<RuleIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dateFilters, setDateFilters] = useState<Record<string, { from: string; to: string }>>({});

  const [deleteTarget, setDeleteTarget] = useState<RuleIssue | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const data = await ruleIssueService.list();
      setRows(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Rule Issue records');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const firewall_rule_idFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.firewall_rule_id ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const related_rule_idFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.related_rule_id ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const issue_typeFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.issue_type ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const severityFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.severity ?? '')).filter(Boolean))).sort(),
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
    if (filters.firewall_rule_id) {
      result = result.filter((row) => String(row.firewall_rule_id ?? '') === filters.firewall_rule_id);
    }
    if (filters.related_rule_id) {
      result = result.filter((row) => String(row.related_rule_id ?? '') === filters.related_rule_id);
    }
    if (filters.issue_type) {
      result = result.filter((row) => String(row.issue_type ?? '') === filters.issue_type);
    }
    if (filters.severity) {
      result = result.filter((row) => String(row.severity ?? '') === filters.severity);
    }
    if (filters.status) {
      result = result.filter((row) => String(row.status ?? '') === filters.status);
    }
    if (dateFilters.detected_at?.from) {
      result = result.filter((row) => String(row.detected_at ?? '') >= dateFilters.detected_at!.from);
    }
    if (dateFilters.detected_at?.to) {
      result = result.filter((row) => String(row.detected_at ?? '') <= dateFilters.detected_at!.to);
    }
    if (dateFilters.resolved_at?.from) {
      result = result.filter((row) => String(row.resolved_at ?? '') >= dateFilters.resolved_at!.from);
    }
    if (dateFilters.resolved_at?.to) {
      result = result.filter((row) => String(row.resolved_at ?? '') <= dateFilters.resolved_at!.to);
    }
    return result;
  }, [rows, search, filters, dateFilters]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function openCreate() {
    navigate('/rule-issues/new');
  }

  function openEdit(row: RuleIssue) {
    navigate(`/rule-issues/${row.rule_issue_id}/edit`);
  }

  function openView(row: RuleIssue) {
    navigate(`/rule-issues/${row.rule_issue_id}`);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await ruleIssueService.remove(deleteTarget.rule_issue_id);
      toast.success('Rule Issue deleted');
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
        <StatCard label="Total Rule Issues" value={rows.length} icon={LayersIcon} />
        <StatCard label="Matching search" value={filtered.length} icon={LayersIcon} accent="bg-emerald-50 text-emerald-600" />
        <StatCard label="Current page" value={`${currentPage} / ${pageCount}`} icon={LayersIcon} accent="bg-amber-50 text-amber-600" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search rule issues..." />
        <Button icon={<PlusIcon className="h-4 w-4" />} onClick={openCreate}>
          Add Rule Issue
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
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
          <label className="text-xs font-medium text-slate-500">Related Rule Id</label>
          <select
            value={filters.related_rule_id ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, related_rule_id: e.target.value })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Related Rule Id</option>
            {related_rule_idFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Issue Type</label>
          <select
            value={filters.issue_type ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, issue_type: e.target.value })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Issue Type</option>
            {issue_typeFilterOptions.map((opt) => (
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
          <label className="text-xs font-medium text-slate-500">Status</label>
          <select
            value={filters.status ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, status: e.target.value })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
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
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Resolved At from</label>
          <input
            type="date"
            value={dateFilters.resolved_at?.from ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, resolved_at: { from: e.target.value, to: f.resolved_at?.to ?? '' } })); setPage(1); }}
            className="rounded-md border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Resolved At to</label>
          <input
            type="date"
            value={dateFilters.resolved_at?.to ?? ''}
            onChange={(e) => { setDateFilters((f) => ({ ...f, resolved_at: { from: f.resolved_at?.from ?? '', to: e.target.value } })); setPage(1); }}
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

      <RuleIssueKanban
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
        title="Delete Rule Issue?"
        description="This action cannot be undone. This will permanently remove the record."
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
