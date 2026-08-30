import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, Pencil as PencilIcon } from 'lucide-react';
import type { LabTestOrder } from '../types/LabTestOrder';
import type { Member } from '../types/Member';
import type { Provider } from '../types/Provider';
import type { LineOfBusiness } from '../types/LineOfBusiness';
import type { LabTestLine } from '../types/LabTestLine';
import type { Claim } from '../types/Claim';
import type { PhiAccessLog } from '../types/PhiAccessLog';
import { labTestOrderService } from '../services/LabTestOrderService';
import { memberService } from '../services/MemberService';
import { providerService } from '../services/ProviderService';
import { lineOfBusinessService } from '../services/LineOfBusinessService';
import { labTestLineService } from '../services/LabTestLineService';
import { claimService } from '../services/ClaimService';
import { phiAccessLogService } from '../services/PhiAccessLogService';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { formatCell } from '../lib/format';

export function LabTestOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<LabTestOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [member_idTarget, setMember_idTarget] = useState<Member | null>(null);
  const [ordering_provider_idTarget, setOrdering_provider_idTarget] = useState<Provider | null>(null);
  const [performing_lab_idTarget, setPerforming_lab_idTarget] = useState<Provider | null>(null);
  const [line_of_business_idTarget, setLine_of_business_idTarget] = useState<LineOfBusiness | null>(null);
  const [labTestLineLinkedRows, setLabTestLineLinkedRows] = useState<LabTestLine[]>([]);
  const [claimLinkedRows, setClaimLinkedRows] = useState<Claim[]>([]);
  const [attachmentRows, setAttachmentRows] = useState<PhiAccessLog[]>([]);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await labTestOrderService.list();
      setRecord(rows.find((r) => String(r.lab_test_order_id) === String(id)) ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Lab Test Order');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [id]);

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
    const fkValue: unknown = record ? record.ordering_provider_id : null;
    if (fkValue === null || fkValue === undefined || fkValue === '') {
      setOrdering_provider_idTarget(null);
      return;
    }
    providerService.getById(fkValue as string | number)
      .then((row) => setOrdering_provider_idTarget(row ?? null))
      .catch(() => setOrdering_provider_idTarget(null));
  }, [record]);

  useEffect(() => {
    const fkValue: unknown = record ? record.performing_lab_id : null;
    if (fkValue === null || fkValue === undefined || fkValue === '') {
      setPerforming_lab_idTarget(null);
      return;
    }
    providerService.getById(fkValue as string | number)
      .then((row) => setPerforming_lab_idTarget(row ?? null))
      .catch(() => setPerforming_lab_idTarget(null));
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
    labTestLineService.list()
      .then((rows) => setLabTestLineLinkedRows(rows.filter((r) => String(r.lab_test_order_id) === String(record.lab_test_order_id))))
      .catch(() => setLabTestLineLinkedRows([]));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    claimService.list()
      .then((rows) => setClaimLinkedRows(rows.filter((r) => String(r.lab_test_order_id) === String(record.lab_test_order_id))))
      .catch(() => setClaimLinkedRows([]));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    phiAccessLogService.list()
      .then((rows) =>
        setAttachmentRows(
          rows.filter(
            (r) => String(r.entity_type) === "LabTestOrder" && String(r.entity_record_id) === String(record.lab_test_order_id),
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
        Lab Test Order not found.
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => navigate('/lab-test-orders')}>
            Back to Lab Test Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/lab-test-orders')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Lab Test Orders
        </button>
        <Button icon={<PencilIcon className="h-4 w-4" />} onClick={() => navigate('/lab-test-orders/' + id + '/edit')}>
          Edit
        </Button>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h1 className="text-lg font-semibold text-slate-900">{formatCell(record.order_number)}</h1>
        <p className="mt-1 text-sm text-slate-500">Lab Test Order details</p>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Lab Test Order Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.lab_test_order_id)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Order Number</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.order_number)}</dd>
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
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Ordering Provider Id</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {ordering_provider_idTarget ? (
                <Link to={`/providers/${record.ordering_provider_id}`} className="text-brand-600 hover:underline">
                  {`${ordering_provider_idTarget.provider_name}`}
                </Link>
              ) : (
                formatCell(record.ordering_provider_id)
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Performing Lab Id</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {performing_lab_idTarget ? (
                <Link to={`/providers/${record.performing_lab_id}`} className="text-brand-600 hover:underline">
                  {`${performing_lab_idTarget.provider_name}`}
                </Link>
              ) : (
                formatCell(record.performing_lab_id)
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
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Order Status</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.order_status)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Priority</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.priority)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Clinical Indication</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.clinical_indication)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Icd10 Codes</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.icd10_codes)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Order Date</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.order_date)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Specimen Collection Date</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.specimen_collection_date)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Result Date</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.result_date)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Prior Auth Required</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.prior_auth_required)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Prior Auth Number</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.prior_auth_number)}</dd>
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
        <h2 className="text-sm font-semibold text-slate-900">Lab Test Lines</h2>
        {labTestLineLinkedRows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No linked lab test lines.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {labTestLineLinkedRows.map((row) => (
              <li key={String(row.lab_test_line_id)}>
                <Link to={`/lab-test-lines/${row.lab_test_line_id}`} className="block py-2 text-sm text-brand-600 hover:underline">
                  {formatCell(row.test_name)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h2 className="text-sm font-semibold text-slate-900">Claims</h2>
        {claimLinkedRows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No linked claims.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {claimLinkedRows.map((row) => (
              <li key={String(row.claim_id)}>
                <Link to={`/claims/${row.claim_id}`} className="block py-2 text-sm text-brand-600 hover:underline">
                  {formatCell(row.claim_number)}
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
