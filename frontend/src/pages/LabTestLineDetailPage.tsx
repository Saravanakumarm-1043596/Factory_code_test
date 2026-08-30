import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, Pencil as PencilIcon } from 'lucide-react';
import type { LabTestLine } from '../types/LabTestLine';
import type { LabTestOrder } from '../types/LabTestOrder';
import type { ClaimLine } from '../types/ClaimLine';
import type { PhiAccessLog } from '../types/PhiAccessLog';
import { labTestLineService } from '../services/LabTestLineService';
import { labTestOrderService } from '../services/LabTestOrderService';
import { claimLineService } from '../services/ClaimLineService';
import { phiAccessLogService } from '../services/PhiAccessLogService';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { formatCell } from '../lib/format';

export function LabTestLineDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<LabTestLine | null>(null);
  const [loading, setLoading] = useState(true);
  const [lab_test_order_idTarget, setLab_test_order_idTarget] = useState<LabTestOrder | null>(null);
  const [claimLineLinkedRows, setClaimLineLinkedRows] = useState<ClaimLine[]>([]);
  const [attachmentRows, setAttachmentRows] = useState<PhiAccessLog[]>([]);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await labTestLineService.list();
      setRecord(rows.find((r) => String(r.lab_test_line_id) === String(id)) ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Lab Test Line');
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
    if (!record) return;
    claimLineService.list()
      .then((rows) => setClaimLineLinkedRows(rows.filter((r) => String(r.lab_test_line_id) === String(record.lab_test_line_id))))
      .catch(() => setClaimLineLinkedRows([]));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    phiAccessLogService.list()
      .then((rows) =>
        setAttachmentRows(
          rows.filter(
            (r) => String(r.entity_type) === "LabTestLine" && String(r.entity_record_id) === String(record.lab_test_line_id),
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
        Lab Test Line not found.
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => navigate('/lab-test-lines')}>
            Back to Lab Test Lines
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/lab-test-lines')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Lab Test Lines
        </button>
        <Button icon={<PencilIcon className="h-4 w-4" />} onClick={() => navigate('/lab-test-lines/' + id + '/edit')}>
          Edit
        </Button>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h1 className="text-lg font-semibold text-slate-900">{formatCell(record.test_name)}</h1>
        <p className="mt-1 text-sm text-slate-500">Lab Test Line details</p>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Lab Test Line Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.lab_test_line_id)}</dd>
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
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Cpt Code</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.cpt_code)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Test Name</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.test_name)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Loinc Code</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.loinc_code)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Test Category</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.test_category)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Result Value</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.result_value)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Result Unit</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.result_unit)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Reference Range</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.reference_range)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Abnormal Flag</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.abnormal_flag)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Line Status</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.line_status)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Result Date</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.result_date)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Created At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.created_at)}</dd>
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
