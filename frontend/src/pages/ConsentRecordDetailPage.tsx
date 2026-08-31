import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, Pencil as PencilIcon, Download as DownloadIcon } from 'lucide-react';
import type { ConsentRecord } from '../types/ConsentRecord';
import type { Patient } from '../types/Patient';
import type { AppUser } from '../types/AppUser';
import { consentRecordService } from '../services/ConsentRecordService';
import { patientService } from '../services/PatientService';
import { appUserService } from '../services/AppUserService';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { formatCell } from '../lib/format';

export function ConsentRecordDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<ConsentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [patient_idTarget, setPatient_idTarget] = useState<Patient | null>(null);
  const [collected_by_user_idTarget, setCollected_by_user_idTarget] = useState<AppUser | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await consentRecordService.list();
      setRecord(rows.find((r) => String(r.consent_record_id) === String(id)) ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Consent Record');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [id]);

  useEffect(() => {
    const fkValue: unknown = record ? record.patient_id : null;
    if (fkValue === null || fkValue === undefined || fkValue === '') {
      setPatient_idTarget(null);
      return;
    }
    patientService.getById(fkValue as string | number)
      .then((row) => setPatient_idTarget(row ?? null))
      .catch(() => setPatient_idTarget(null));
  }, [record]);

  useEffect(() => {
    const fkValue: unknown = record ? record.collected_by_user_id : null;
    if (fkValue === null || fkValue === undefined || fkValue === '') {
      setCollected_by_user_idTarget(null);
      return;
    }
    appUserService.getById(fkValue as string | number)
      .then((row) => setCollected_by_user_idTarget(row ?? null))
      .catch(() => setCollected_by_user_idTarget(null));
  }, [record]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-md border border-slate-200 bg-white p-3.5" />;
  }

  if (!record) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-3.5 text-center text-sm text-slate-500">
        Consent Record not found.
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => navigate('/consent-records')}>
            Back to Consent Records
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/consent-records')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Consent Records
        </button>
        <Button icon={<PencilIcon className="h-4 w-4" />} onClick={() => navigate('/consent-records/' + id + '/edit')}>
          Edit
        </Button>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h1 className="text-lg font-semibold text-slate-900">{formatCell(record.consent_record_id)}</h1>
        <p className="mt-1 text-sm text-slate-500">Consent Record details</p>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Consent Record Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.consent_record_id)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Patient Id</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {patient_idTarget ? (
                <Link to={`/patients/${record.patient_id}`} className="text-brand-600 hover:underline">
                  {`${patient_idTarget.first_name}`}
                </Link>
              ) : (
                formatCell(record.patient_id)
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Consent Type</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.consent_type)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.status)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Granted At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.granted_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Expires At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.expires_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Revoked At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.revoked_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Collected By User Id</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {collected_by_user_idTarget ? (
                <Link to={`/app-users/${record.collected_by_user_id}`} className="text-brand-600 hover:underline">
                  {`${collected_by_user_idTarget.first_name}`}
                </Link>
              ) : (
                formatCell(record.collected_by_user_id)
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Consent Document</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {record.consent_document ? (
                <a href={String(record.consent_document)} download className="inline-flex items-center gap-1 text-brand-600 hover:underline">
                  <DownloadIcon className="h-3.5 w-3.5" /> Download
                </a>
              ) : (
                '—'
              )}
            </dd>
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
    </div>
  );
}
