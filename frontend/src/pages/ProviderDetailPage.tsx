import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, Pencil as PencilIcon } from 'lucide-react';
import type { Provider } from '../types/Provider';
import type { LabTestOrder } from '../types/LabTestOrder';
import type { Claim } from '../types/Claim';
import type { PhiAccessLog } from '../types/PhiAccessLog';
import { providerService } from '../services/ProviderService';
import { labTestOrderService } from '../services/LabTestOrderService';
import { claimService } from '../services/ClaimService';
import { phiAccessLogService } from '../services/PhiAccessLogService';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { formatCell } from '../lib/format';

export function ProviderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [labTestOrderLinkedRows, setLabTestOrderLinkedRows] = useState<LabTestOrder[]>([]);
  const [labTestOrderPerformingLabIdLinkedRows, setLabTestOrderPerformingLabIdLinkedRows] = useState<LabTestOrder[]>([]);
  const [claimLinkedRows, setClaimLinkedRows] = useState<Claim[]>([]);
  const [attachmentRows, setAttachmentRows] = useState<PhiAccessLog[]>([]);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await providerService.list();
      setRecord(rows.find((r) => String(r.provider_id) === String(id)) ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Provider');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [id]);

  useEffect(() => {
    if (!record) return;
    labTestOrderService.list()
      .then((rows) => setLabTestOrderLinkedRows(rows.filter((r) => String(r.ordering_provider_id) === String(record.provider_id))))
      .catch(() => setLabTestOrderLinkedRows([]));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    labTestOrderService.list()
      .then((rows) => setLabTestOrderPerformingLabIdLinkedRows(rows.filter((r) => String(r.performing_lab_id) === String(record.provider_id))))
      .catch(() => setLabTestOrderPerformingLabIdLinkedRows([]));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    claimService.list()
      .then((rows) => setClaimLinkedRows(rows.filter((r) => String(r.rendering_provider_id) === String(record.provider_id))))
      .catch(() => setClaimLinkedRows([]));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    phiAccessLogService.list()
      .then((rows) =>
        setAttachmentRows(
          rows.filter(
            (r) => String(r.entity_type) === "Provider" && String(r.entity_record_id) === String(record.provider_id),
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
        Provider not found.
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => navigate('/providers')}>
            Back to Providers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/providers')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Providers
        </button>
        <Button icon={<PencilIcon className="h-4 w-4" />} onClick={() => navigate('/providers/' + id + '/edit')}>
          Edit
        </Button>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h1 className="text-lg font-semibold text-slate-900">{formatCell(record.provider_name)}</h1>
        <p className="mt-1 text-sm text-slate-500">Provider details</p>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Provider Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.provider_id)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Npi</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.npi)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Provider Name</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.provider_name)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Provider Type</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.provider_type)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Tax Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.tax_id)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Clia Number</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.clia_number)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Network Status</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.network_status)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Address</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.address)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Phone</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.phone)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.email)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Is Active</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.is_active)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Created At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.created_at)}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h2 className="text-sm font-semibold text-slate-900">Lab Test Orders</h2>
        {labTestOrderLinkedRows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No linked lab test orders.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {labTestOrderLinkedRows.map((row) => (
              <li key={String(row.lab_test_order_id)}>
                <Link to={`/lab-test-orders/${row.lab_test_order_id}`} className="block py-2 text-sm text-brand-600 hover:underline">
                  {formatCell(row.order_number)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h2 className="text-sm font-semibold text-slate-900">Lab Test Orders (Performing Lab Id)</h2>
        {labTestOrderPerformingLabIdLinkedRows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No linked lab test orders.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {labTestOrderPerformingLabIdLinkedRows.map((row) => (
              <li key={String(row.lab_test_order_id)}>
                <Link to={`/lab-test-orders/${row.lab_test_order_id}`} className="block py-2 text-sm text-brand-600 hover:underline">
                  {formatCell(row.order_number)}
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
