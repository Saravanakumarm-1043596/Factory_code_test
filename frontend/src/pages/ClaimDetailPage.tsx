import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, Pencil as PencilIcon } from 'lucide-react';
import type { Claim } from '../types/Claim';
import type { LabTestOrder } from '../types/LabTestOrder';
import type { Member } from '../types/Member';
import type { Provider } from '../types/Provider';
import type { LineOfBusiness } from '../types/LineOfBusiness';
import type { ClaimLine } from '../types/ClaimLine';
import type { ClaimError } from '../types/ClaimError';
import type { PhiAccessLog } from '../types/PhiAccessLog';
import { claimService } from '../services/ClaimService';
import { labTestOrderService } from '../services/LabTestOrderService';
import { memberService } from '../services/MemberService';
import { providerService } from '../services/ProviderService';
import { lineOfBusinessService } from '../services/LineOfBusinessService';
import { claimLineService } from '../services/ClaimLineService';
import { claimErrorService } from '../services/ClaimErrorService';
import { phiAccessLogService } from '../services/PhiAccessLogService';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { formatCell } from '../lib/format';

export function ClaimDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [lab_test_order_idTarget, setLab_test_order_idTarget] = useState<LabTestOrder | null>(null);
  const [member_idTarget, setMember_idTarget] = useState<Member | null>(null);
  const [rendering_provider_idTarget, setRendering_provider_idTarget] = useState<Provider | null>(null);
  const [line_of_business_idTarget, setLine_of_business_idTarget] = useState<LineOfBusiness | null>(null);
  const [claimLineLinkedRows, setClaimLineLinkedRows] = useState<ClaimLine[]>([]);
  const [claimErrorLinkedRows, setClaimErrorLinkedRows] = useState<ClaimError[]>([]);
  const [attachmentRows, setAttachmentRows] = useState<PhiAccessLog[]>([]);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await claimService.list();
      setRecord(rows.find((r) => String(r.claim_id) === String(id)) ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Claim');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [id]);

  useEffect(() => {
    const fkValue: unknown = record ? record.lab_test_order_id : null;
    if (fkValue === null || fkValue === undefined || fkValue === '') {
      setLab_test_order_idTarget(null);
      return;
    }
    labTestOrderService.getById(fkValue as string | number)
      .then((row) => setLab_test_order_idTarget(row ?? null))
      .catch(() => setLab_test_order_idTarget(null));
  }, [record]);

  useEffect(() => {
    const fkValue: unknown = record ? record.member_id : null;
    if (fkValue === null || fkValue === undefined || fkValue === '') {
      setMember_idTarget(null);
      return;
    }
    memberService.getById(fkValue as string | number)
      .then((row) => setMember_idTarget(row ?? null))
      .catch(() => setMember_idTarget(null));
  }, [record]);

  useEffect(() => {
    const fkValue: unknown = record ? record.rendering_provider_id : null;
    if (fkValue === null || fkValue === undefined || fkValue === '') {
      setRendering_provider_idTarget(null);
      return;
    }
    providerService.getById(fkValue as string | number)
      .then((row) => setRendering_provider_idTarget(row ?? null))
      .catch(() => setRendering_provider_idTarget(null));
  }, [record]);

  useEffect(() => {
    const fkValue: unknown = record ? record.line_of_business_id : null;
    if (fkValue === null || fkValue === undefined || fkValue === '') {
      setLine_of_business_idTarget(null);
      return;
    }
    lineOfBusinessService.getById(fkValue as string | number)
      .then((row) => setLine_of_business_idTarget(row ?? null))
      .catch(() => setLine_of_business_idTarget(null));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    claimLineService.list()
      .then((rows) => setClaimLineLinkedRows(rows.filter((r) => String(r.claim_id) === String(record.claim_id))))
      .catch(() => setClaimLineLinkedRows([]));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    claimErrorService.list()
      .then((rows) => setClaimErrorLinkedRows(rows.filter((r) => String(r.claim_id) === String(record.claim_id))))
      .catch(() => setClaimErrorLinkedRows([]));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    phiAccessLogService.list()
      .then((rows) =>
        setAttachmentRows(
          rows.filter(
            (r) => String(r.entity_type) === "Claim" && String(r.entity_record_id) === String(record.claim_id),
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
        Claim not found.
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => navigate('/claims')}>
            Back to Claims
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/claims')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Claims
        </button>
        <Button icon={<PencilIcon className="h-4 w-4" />} onClick={() => navigate('/claims/' + id + '/edit')}>
          Edit
        </Button>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h1 className="text-lg font-semibold text-slate-900">{formatCell(record.claim_number)}</h1>
        <p className="mt-1 text-sm text-slate-500">Claim details</p>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Claim Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.claim_id)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Claim Number</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.claim_number)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Lab Test Order Id</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {lab_test_order_idTarget ? (
                <Link to={`/lab-test-orders/${record.lab_test_order_id}`} className="text-brand-600 hover:underline">
                  {`${lab_test_order_idTarget.order_number}`}
                </Link>
              ) : (
                formatCell(record.lab_test_order_id)
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Member Id</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {member_idTarget ? (
                <Link to={`/members/${record.member_id}`} className="text-brand-600 hover:underline">
                  {`${member_idTarget.first_name}`}
                </Link>
              ) : (
                formatCell(record.member_id)
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Rendering Provider Id</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {rendering_provider_idTarget ? (
                <Link to={`/providers/${record.rendering_provider_id}`} className="text-brand-600 hover:underline">
                  {`${rendering_provider_idTarget.provider_name}`}
                </Link>
              ) : (
                formatCell(record.rendering_provider_id)
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Line Of Business Id</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {line_of_business_idTarget ? (
                <Link to={`/line-of-businesses/${record.line_of_business_id}`} className="text-brand-600 hover:underline">
                  {`#${line_of_business_idTarget.line_of_business_id}`}
                </Link>
              ) : (
                formatCell(record.line_of_business_id)
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Source System</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.source_system)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Claim Type</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.claim_type)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Claim Status</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.claim_status)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Billed Amount</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.total_billed_amount)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Allowed Amount</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.total_allowed_amount)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Paid Amount</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.total_paid_amount)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Member Responsibility</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.member_responsibility)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Service Date</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.service_date)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Submitted Date</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.submitted_date)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Adjudicated Date</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.adjudicated_date)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Has Error</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.has_error)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Denial Reason Code</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.denial_reason_code)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Notes</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.notes)}</dd>
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
        <h2 className="text-sm font-semibold text-slate-900">Claim Lines</h2>
        {claimLineLinkedRows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No linked claim lines.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {claimLineLinkedRows.map((row) => (
              <li key={String(row.claim_line_id)}>
                <Link to={`/claim-lines/${row.claim_line_id}`} className="block py-2 text-sm text-brand-600 hover:underline">
                  {formatCell(row.cpt_code)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h2 className="text-sm font-semibold text-slate-900">Claim Errors</h2>
        {claimErrorLinkedRows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No linked claim errors.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {claimErrorLinkedRows.map((row) => (
              <li key={String(row.claim_error_id)}>
                <Link to={`/claim-errors/${row.claim_error_id}`} className="block py-2 text-sm text-brand-600 hover:underline">
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
