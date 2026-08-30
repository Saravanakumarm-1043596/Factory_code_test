import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, Pencil as PencilIcon, Download as DownloadIcon } from 'lucide-react';
import type { ComplianceControl } from '../types/ComplianceControl';
import type { ComplianceFinding } from '../types/ComplianceFinding';
import type { PhiAccessLog } from '../types/PhiAccessLog';
import { complianceControlService } from '../services/ComplianceControlService';
import { complianceFindingService } from '../services/ComplianceFindingService';
import { phiAccessLogService } from '../services/PhiAccessLogService';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { formatCell } from '../lib/format';

export function ComplianceControlDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<ComplianceControl | null>(null);
  const [loading, setLoading] = useState(true);
  const [complianceFindingLinkedRows, setComplianceFindingLinkedRows] = useState<ComplianceFinding[]>([]);
  const [attachmentRows, setAttachmentRows] = useState<PhiAccessLog[]>([]);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await complianceControlService.list();
      setRecord(rows.find((r) => String(r.compliance_control_id) === String(id)) ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Compliance Control');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [id]);

  useEffect(() => {
    if (!record) return;
    complianceFindingService.list()
      .then((rows) => setComplianceFindingLinkedRows(rows.filter((r) => String(r.compliance_control_id) === String(record.compliance_control_id))))
      .catch(() => setComplianceFindingLinkedRows([]));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    phiAccessLogService.list()
      .then((rows) =>
        setAttachmentRows(
          rows.filter(
            (r) => String(r.entity_type) === "ComplianceControl" && String(r.entity_record_id) === String(record.compliance_control_id),
          ),
        ),
      )
      .catch(() => setAttachmentRows([]));
  }, [record]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-md border border-slate-200 bg-white p-3.5" />;
  }

  if (!record) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-3.5 text-center text-sm text-slate-500">
        Compliance Control not found.
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => navigate('/compliance-controls')}>
            Back to Compliance Controls
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/compliance-controls')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Compliance Controls
        </button>
        <Button icon={<PencilIcon className="h-4 w-4" />} onClick={() => navigate('/compliance-controls/' + id + '/edit')}>
          Edit
        </Button>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h1 className="text-lg font-semibold text-slate-900">{formatCell(record.control_name)}</h1>
        <p className="mt-1 text-sm text-slate-500">Compliance Control details</p>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Compliance Control Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.compliance_control_id)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Control Framework</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.control_framework)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Control Identifier</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.control_identifier)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Control Name</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.control_name)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Description</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.description)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Control Category</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.control_category)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.status)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Risk Level</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.risk_level)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Last Assessment Date</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.last_assessment_date)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Next Assessment Date</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.next_assessment_date)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Responsible Party</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.responsible_party)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Evidence Document</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {record.evidence_document ? (
                <a href={String(record.evidence_document)} download className="inline-flex items-center gap-1 text-brand-600 hover:underline">
                  <DownloadIcon className="h-3.5 w-3.5" /> Download
                </a>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Remediation Notes</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.remediation_notes)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Created At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.created_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Updated At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.updated_at)}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h2 className="text-sm font-semibold text-slate-900">Compliance Findings</h2>
        {complianceFindingLinkedRows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No linked compliance findings.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {complianceFindingLinkedRows.map((row) => (
              <li key={String(row.compliance_finding_id)}>
                <Link to={`/compliance-findings/${row.compliance_finding_id}`} className="block py-2 text-sm text-brand-600 hover:underline">
                  {formatCell(row.assigned_to)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h2 className="text-sm font-semibold text-slate-900">Attachments</h2>
        {attachmentRows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No attachments.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {attachmentRows.map((row) => (
              <li key={String(row.phi_access_log_id)} className="flex items-center justify-between py-2 text-sm">
                <span className="text-slate-700">{formatCell(row.ip_address)}</span>

              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
