import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, Pencil as PencilIcon, Download as DownloadIcon } from 'lucide-react';
import type { ComplianceFinding } from '../types/ComplianceFinding';
import type { ComplianceControl } from '../types/ComplianceControl';
import type { LineOfBusiness } from '../types/LineOfBusiness';
import type { PhiAccessLog } from '../types/PhiAccessLog';
import { complianceFindingService } from '../services/ComplianceFindingService';
import { complianceControlService } from '../services/ComplianceControlService';
import { lineOfBusinessService } from '../services/LineOfBusinessService';
import { phiAccessLogService } from '../services/PhiAccessLogService';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { formatCell } from '../lib/format';

export function ComplianceFindingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<ComplianceFinding | null>(null);
  const [loading, setLoading] = useState(true);
  const [compliance_control_idTarget, setCompliance_control_idTarget] = useState<ComplianceControl | null>(null);
  const [affected_line_of_business_idTarget, setAffected_line_of_business_idTarget] = useState<LineOfBusiness | null>(null);
  const [attachmentRows, setAttachmentRows] = useState<PhiAccessLog[]>([]);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await complianceFindingService.list();
      setRecord(rows.find((r) => String(r.compliance_finding_id) === String(id)) ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Compliance Finding');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [id]);

  useEffect(() => {
    const fkValue: unknown = record ? record.compliance_control_id : null;
    if (fkValue === null || fkValue === undefined || fkValue === '') {
      setCompliance_control_idTarget(null);
      return;
    }
    complianceControlService.getById(fkValue as string | number)
      .then((row) => setCompliance_control_idTarget(row ?? null))
      .catch(() => setCompliance_control_idTarget(null));
  }, [record]);

  useEffect(() => {
    const fkValue: unknown = record ? record.affected_line_of_business_id : null;
    if (fkValue === null || fkValue === undefined || fkValue === '') {
      setAffected_line_of_business_idTarget(null);
      return;
    }
    lineOfBusinessService.getById(fkValue as string | number)
      .then((row) => setAffected_line_of_business_idTarget(row ?? null))
      .catch(() => setAffected_line_of_business_idTarget(null));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    phiAccessLogService.list()
      .then((rows) =>
        setAttachmentRows(
          rows.filter(
            (r) => String(r.entity_type) === "ComplianceFinding" && String(r.entity_record_id) === String(record.compliance_finding_id),
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
        Compliance Finding not found.
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => navigate('/compliance-findings')}>
            Back to Compliance Findings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/compliance-findings')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Compliance Findings
        </button>
        <Button icon={<PencilIcon className="h-4 w-4" />} onClick={() => navigate('/compliance-findings/' + id + '/edit')}>
          Edit
        </Button>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h1 className="text-lg font-semibold text-slate-900">{formatCell(record.assigned_to)}</h1>
        <p className="mt-1 text-sm text-slate-500">Compliance Finding details</p>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Compliance Finding Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.compliance_finding_id)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Compliance Control Id</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {compliance_control_idTarget ? (
                <Link to={`/compliance-controls/${record.compliance_control_id}`} className="text-brand-600 hover:underline">
                  {`${compliance_control_idTarget.control_name}`}
                </Link>
              ) : (
                formatCell(record.compliance_control_id)
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Finding Type</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.finding_type)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Severity</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.severity)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Description</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.description)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Affected System</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.affected_system)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Affected Line Of Business Id</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {affected_line_of_business_idTarget ? (
                <Link to={`/line-of-businesses/${record.affected_line_of_business_id}`} className="text-brand-600 hover:underline">
                  {`#${affected_line_of_business_idTarget.line_of_business_id}`}
                </Link>
              ) : (
                formatCell(record.affected_line_of_business_id)
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.status)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Assigned To</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.assigned_to)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Remediation Plan</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.remediation_plan)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Due Date</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.due_date)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Evidence Attachment</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {record.evidence_attachment ? (
                <a href={String(record.evidence_attachment)} download className="inline-flex items-center gap-1 text-brand-600 hover:underline">
                  <DownloadIcon className="h-3.5 w-3.5" /> Download
                </a>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Found Date</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.found_date)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Resolved Date</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.resolved_date)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Created At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.created_at)}</dd>
          </div>
        </dl>
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
