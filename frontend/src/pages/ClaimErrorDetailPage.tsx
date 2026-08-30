import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, Pencil as PencilIcon } from 'lucide-react';
import type { ClaimError } from '../types/ClaimError';
import type { Claim } from '../types/Claim';
import type { ClaimLine } from '../types/ClaimLine';
import type { PhiAccessLog } from '../types/PhiAccessLog';
import { claimErrorService } from '../services/ClaimErrorService';
import { claimService } from '../services/ClaimService';
import { claimLineService } from '../services/ClaimLineService';
import { phiAccessLogService } from '../services/PhiAccessLogService';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { formatCell } from '../lib/format';

export function ClaimErrorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<ClaimError | null>(null);
  const [loading, setLoading] = useState(true);
  const [claim_idTarget, setClaim_idTarget] = useState<Claim | null>(null);
  const [claim_line_idTarget, setClaim_line_idTarget] = useState<ClaimLine | null>(null);
  const [attachmentRows, setAttachmentRows] = useState<PhiAccessLog[]>([]);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await claimErrorService.list();
      setRecord(rows.find((r) => String(r.claim_error_id) === String(id)) ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Claim Error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [id]);

  useEffect(() => {
    const fkValue: unknown = record ? record.claim_id : null;
    if (fkValue === null || fkValue === undefined || fkValue === '') {
      setClaim_idTarget(null);
      return;
    }
    claimService.getById(fkValue as string | number)
      .then((row) => setClaim_idTarget(row ?? null))
      .catch(() => setClaim_idTarget(null));
  }, [record]);

  useEffect(() => {
    const fkValue: unknown = record ? record.claim_line_id : null;
    if (fkValue === null || fkValue === undefined || fkValue === '') {
      setClaim_line_idTarget(null);
      return;
    }
    claimLineService.getById(fkValue as string | number)
      .then((row) => setClaim_line_idTarget(row ?? null))
      .catch(() => setClaim_line_idTarget(null));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    phiAccessLogService.list()
      .then((rows) =>
        setAttachmentRows(
          rows.filter(
            (r) => String(r.entity_type) === "ClaimError" && String(r.entity_record_id) === String(record.claim_error_id),
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
        Claim Error not found.
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => navigate('/claim-errors')}>
            Back to Claim Errors
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/claim-errors')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Claim Errors
        </button>
        <Button icon={<PencilIcon className="h-4 w-4" />} onClick={() => navigate('/claim-errors/' + id + '/edit')}>
          Edit
        </Button>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h1 className="text-lg font-semibold text-slate-900">{formatCell(record.assigned_to)}</h1>
        <p className="mt-1 text-sm text-slate-500">Claim Error details</p>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Claim Error Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.claim_error_id)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Claim Id</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {claim_idTarget ? (
                <Link to={`/claims/${record.claim_id}`} className="text-brand-600 hover:underline">
                  {`${claim_idTarget.claim_number}`}
                </Link>
              ) : (
                formatCell(record.claim_id)
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Claim Line Id</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {claim_line_idTarget ? (
                <Link to={`/claim-lines/${record.claim_line_id}`} className="text-brand-600 hover:underline">
                  {`${claim_line_idTarget.cpt_code}`}
                </Link>
              ) : (
                formatCell(record.claim_line_id)
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Error Category</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.error_category)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Error Severity</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.error_severity)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Error Description</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.error_description)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Source System Origin</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.source_system_origin)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Resolution Status</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.resolution_status)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Assigned To</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.assigned_to)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Resolution Notes</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.resolution_notes)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Detected Date</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.detected_date)}</dd>
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
