import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, Pencil as PencilIcon } from 'lucide-react';
import type { PhiaccessLog } from '../types/PhiaccessLog';
import type { AppUser } from '../types/AppUser';
import type { Patient } from '../types/Patient';
import { phiaccessLogService } from '../services/PhiaccessLogService';
import { appUserService } from '../services/AppUserService';
import { patientService } from '../services/PatientService';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { formatCell } from '../lib/format';

export function PhiaccessLogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<PhiaccessLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [user_idTarget, setUser_idTarget] = useState<AppUser | null>(null);
  const [patient_idTarget, setPatient_idTarget] = useState<Patient | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await phiaccessLogService.list();
      setRecord(rows.find((r) => String(r.phi_access_log_id) === String(id)) ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Phiaccess Log');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [id]);

  useEffect(() => {
    const fkValue: unknown = record ? record.user_id : null;
    if (fkValue === null || fkValue === undefined || fkValue === '') {
      setUser_idTarget(null);
      return;
    }
    appUserService.getById(fkValue as string | number)
      .then((row) => setUser_idTarget(row ?? null))
      .catch(() => setUser_idTarget(null));
  }, [record]);

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

  if (loading) {
    return <div className="h-64 animate-pulse rounded-md border border-slate-200 bg-white p-3.5" />;
  }

  if (!record) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-3.5 text-center text-sm text-slate-500">
        Phiaccess Log not found.
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => navigate('/phiaccess-logs')}>
            Back to Phiaccess Logs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/phiaccess-logs')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Phiaccess Logs
        </button>
        <Button icon={<PencilIcon className="h-4 w-4" />} onClick={() => navigate('/phiaccess-logs/' + id + '/edit')}>
          Edit
        </Button>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h1 className="text-lg font-semibold text-slate-900">{formatCell(record.resource_id)}</h1>
        <p className="mt-1 text-sm text-slate-500">Phiaccess Log details</p>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Phi Access Log Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.phi_access_log_id)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">User Id</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {user_idTarget ? (
                <Link to={`/app-users/${record.user_id}`} className="text-brand-600 hover:underline">
                  {`${user_idTarget.first_name}`}
                </Link>
              ) : (
                formatCell(record.user_id)
              )}
            </dd>
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
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Resource Type</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.resource_type)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Resource Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.resource_id)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Action</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.action)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Access Reason</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.access_reason)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Ip Address</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.ip_address)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">User Agent</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.user_agent)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Ehr Source System</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.ehr_source_system)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Access Granted</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.access_granted)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Denial Reason</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.denial_reason)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Accessed At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.accessed_at)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
