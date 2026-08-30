import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus as PlusIcon } from 'lucide-react';
import type { Member } from '../types/Member';
import { memberService } from '../services/MemberService';
import { MemberDirectory } from '../components/Member/MemberDirectory';
import { SearchInput } from '../components/ui/SearchInput';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { Layers as LayersIcon } from 'lucide-react';

const PAGE_SIZE = 8;
const SEARCHABLE_FIELDS: Array<keyof Member> = [
  "facets_member_id",
  "epic_mrn",
  "first_name",
  "last_name",
];

export function MemberListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dateFilters, setDateFilters] = useState<Record<string, { from: string; to: string }>>({});

  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const data = await memberService.list();
      setRows(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Member records');
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

  const line_of_business_idFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.line_of_business_id ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const plan_typeFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.plan_type ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const coverage_start_dateFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.coverage_start_date ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const coverage_end_dateFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.coverage_end_date ?? '')).filter(Boolean))).sort(),
    [rows],
  );

  const member_statusFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => String(row.member_status ?? '')).filter(Boolean))).sort(),
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
    if (filters.line_of_business_id) {
      result = result.filter((row) => String(row.line_of_business_id ?? '') === filters.line_of_business_id);
    }
    if (filters.plan_type) {
      result = result.filter((row) => String(row.plan_type ?? '') === filters.plan_type);
    }
    if (filters.coverage_start_date) {
      result = result.filter((row) => String(row.coverage_start_date ?? '') === filters.coverage_start_date);
    }
    if (filters.coverage_end_date) {
      result = result.filter((row) => String(row.coverage_end_date ?? '') === filters.coverage_end_date);
    }
    if (filters.member_status) {
      result = result.filter((row) => String(row.member_status ?? '') === filters.member_status);
    }
    if (dateFilters.date_of_birth?.from) {
      result = result.filter((row) => String(row.date_of_birth ?? '') >= dateFilters.date_of_birth!.from);
    }
    if (dateFilters.date_of_birth?.to) {
      result = result.filter((row) => String(row.date_of_birth ?? '') <= dateFilters.date_of_birth!.to);
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
    navigate('/members/new');
  }

  function openEdit(row: Member) {
    navigate(`/members/${row.member_id}/edit`);
  }

  function openView(row: Member) {
    navigate(`/members/${row.member_id}`);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await memberService.remove(deleteTarget.member_id);
      toast.success('Member deleted');
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
        <StatCard label="Total Members" value={rows.length} icon={LayersIcon} />
        <StatCard label="Matching search" value={filtered.length} icon={LayersIcon} accent="bg-emerald-50 text-emerald-600" />
        <StatCard label="Current page" value={`${currentPage} / ${pageCount}`} icon={LayersIcon} accent="bg-amber-50 text-amber-600" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search members..." />
        <Button icon={<PlusIcon className="h-4 w-4" />} onClick={openCreate}>
          Add Member
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
          <label className="text-xs font-medium text-slate-500">Plan Type</label>
          <select
            value={filters.plan_type ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, plan_type: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Plan Type</option>
            {plan_typeFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Coverage Start Date</label>
          <select
            value={filters.coverage_start_date ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, coverage_start_date: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Coverage Start Date</option>
            {coverage_start_dateFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Coverage End Date</label>
          <select
            value={filters.coverage_end_date ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, coverage_end_date: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Coverage End Date</option>
            {coverage_end_dateFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Member Status</label>
          <select
            value={filters.member_status ?? ''}
            onChange={(e) => { setFilters((f) => ({ ...f, member_status: e.target.value })); setPage(1); }}
            className="rounded-sm border-0 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          >
            <option value="">All Member Status</option>
            {member_statusFilterOptions.map((opt) => (
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

      <MemberDirectory
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
        title="Delete Member?"
        description="This action cannot be undone. This will permanently remove the record."
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
