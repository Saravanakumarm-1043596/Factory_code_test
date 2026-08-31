import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, Pencil as PencilIcon, Download as DownloadIcon } from 'lucide-react';
import type { AuditScan } from '../types/AuditScan';
import type { ScanFinding } from '../types/ScanFinding';
import { auditScanService } from '../services/AuditScanService';
import { scanFindingService } from '../services/ScanFindingService';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { formatCell } from '../lib/format';

export function AuditScanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<AuditScan | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanFindingLinkedRows, setScanFindingLinkedRows] = useState<ScanFinding[]>([]);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await auditScanService.list();
      setRecord(rows.find((r) => String(r.audit_scan_id) === String(id)) ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Audit Scan');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [id]);

  useEffect(() => {
    if (!record) return;
    scanFindingService.list()
      .then((rows) => setScanFindingLinkedRows(rows.filter((r) => String(r.audit_scan_id) === String(record.audit_scan_id))))
      .catch(() => setScanFindingLinkedRows([]));
  }, [record]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white shadow-sm p-4" />;
  }

  if (!record) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 text-center text-sm text-slate-500">
        Audit Scan not found.
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => navigate('/audit-scans')}>
            Back to Audit Scans
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/audit-scans')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Audit Scans
        </button>
        <Button icon={<PencilIcon className="h-4 w-4" />} onClick={() => navigate('/audit-scans/' + id + '/edit')}>
          Edit
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <h1 className="text-lg font-semibold text-slate-900">{formatCell(record.scan_name)}</h1>
        <p className="mt-1 text-sm text-slate-500">Audit Scan details</p>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Audit Scan Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.audit_scan_id)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Scan Name</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.scan_name)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Scan Type</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.scan_type)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.status)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Scope Description</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.scope_description)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Rules Analyzed</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.total_rules_analyzed)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Issues Found</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.issues_found)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Critical Issues Found</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.critical_issues_found)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Initiated By</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.initiated_by)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Report File</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {record.report_file ? (
                <a href={String(record.report_file)} download className="inline-flex items-center gap-1 text-brand-600 hover:underline">
                  <DownloadIcon className="h-3.5 w-3.5" /> Download
                </a>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Started At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.started_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Completed At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.completed_at)}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <h2 className="text-sm font-semibold text-slate-900">Scan Findings</h2>
        {scanFindingLinkedRows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No linked scan findings.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {scanFindingLinkedRows.map((row) => (
              <li key={String(row.scan_finding_id)}>
                <Link to={`/scan-findings/${row.scan_finding_id}`} className="block py-2 text-sm text-brand-600 hover:underline">
                  {formatCell(row.detail)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
