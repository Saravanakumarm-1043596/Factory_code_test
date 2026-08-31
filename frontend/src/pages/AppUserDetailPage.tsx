import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, Pencil as PencilIcon } from 'lucide-react';
import type { AppUser } from '../types/AppUser';
import type { Clinician } from '../types/Clinician';
import type { Facility } from '../types/Facility';
import type { BreachIncident } from '../types/BreachIncident';
import type { PhiaccessLog } from '../types/PhiaccessLog';
import type { ConsentRecord } from '../types/ConsentRecord';
import { appUserService } from '../services/AppUserService';
import { clinicianService } from '../services/ClinicianService';
import { facilityService } from '../services/FacilityService';
import { breachIncidentService } from '../services/BreachIncidentService';
import { phiaccessLogService } from '../services/PhiaccessLogService';
import { consentRecordService } from '../services/ConsentRecordService';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { formatCell } from '../lib/format';

export function AppUserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [clinician_idTarget, setClinician_idTarget] = useState<Clinician | null>(null);
  const [facility_idTarget, setFacility_idTarget] = useState<Facility | null>(null);
  const [breachIncidentLinkedRows, setBreachIncidentLinkedRows] = useState<BreachIncident[]>([]);
  const [phiaccessLogLinkedRows, setPhiaccessLogLinkedRows] = useState<PhiaccessLog[]>([]);
  const [consentRecordLinkedRows, setConsentRecordLinkedRows] = useState<ConsentRecord[]>([]);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await appUserService.list();
      setRecord(rows.find((r) => String(r.app_user_id) === String(id)) ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load App User');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [id]);

  useEffect(() => {
    const fkValue: unknown = record ? record.clinician_id : null;
    if (fkValue === null || fkValue === undefined || fkValue === '') {
      setClinician_idTarget(null);
      return;
    }
    clinicianService.getById(fkValue as string | number)
      .then((row) => setClinician_idTarget(row ?? null))
      .catch(() => setClinician_idTarget(null));
  }, [record]);

  useEffect(() => {
    const fkValue: unknown = record ? record.facility_id : null;
    if (fkValue === null || fkValue === undefined || fkValue === '') {
      setFacility_idTarget(null);
      return;
    }
    facilityService.getById(fkValue as string | number)
      .then((row) => setFacility_idTarget(row ?? null))
      .catch(() => setFacility_idTarget(null));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    breachIncidentService.list()
      .then((rows) => setBreachIncidentLinkedRows(rows.filter((r) => String(r.reported_by_user_id) === String(record.app_user_id))))
      .catch(() => setBreachIncidentLinkedRows([]));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    phiaccessLogService.list()
      .then((rows) => setPhiaccessLogLinkedRows(rows.filter((r) => String(r.user_id) === String(record.app_user_id))))
      .catch(() => setPhiaccessLogLinkedRows([]));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    consentRecordService.list()
      .then((rows) => setConsentRecordLinkedRows(rows.filter((r) => String(r.collected_by_user_id) === String(record.app_user_id))))
      .catch(() => setConsentRecordLinkedRows([]));
  }, [record]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-md border border-slate-200 bg-white p-3.5" />;
  }

  if (!record) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-3.5 text-center text-sm text-slate-500">
        App User not found.
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => navigate('/app-users')}>
            Back to App Users
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/app-users')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to App Users
        </button>
        <Button icon={<PencilIcon className="h-4 w-4" />} onClick={() => navigate('/app-users/' + id + '/edit')}>
          Edit
        </Button>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h1 className="text-lg font-semibold text-slate-900">{formatCell(record.first_name)}</h1>
        <p className="mt-1 text-sm text-slate-500">App User details</p>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">App User Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.app_user_id)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.email)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">First Name</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.first_name)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Last Name</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.last_name)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Role</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.role)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Clinician Id</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {clinician_idTarget ? (
                <Link to={`/clinicians/${record.clinician_id}`} className="text-brand-600 hover:underline">
                  {`${clinician_idTarget.first_name}`}
                </Link>
              ) : (
                formatCell(record.clinician_id)
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Facility Id</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {facility_idTarget ? (
                <Link to={`/facilities/${record.facility_id}`} className="text-brand-600 hover:underline">
                  {`${facility_idTarget.name}`}
                </Link>
              ) : (
                formatCell(record.facility_id)
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.status)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Mfa Enabled</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.mfa_enabled)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Last Login At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.last_login_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Password Changed At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.password_changed_at)}</dd>
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
        <h2 className="text-sm font-semibold text-slate-900">Breach Incidents</h2>
        {breachIncidentLinkedRows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No linked breach incidents.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {breachIncidentLinkedRows.map((row) => (
              <li key={String(row.breach_incident_id)}>
                <Link to={`/breach-incidents/${row.breach_incident_id}`} className="block py-2 text-sm text-brand-600 hover:underline">
                  {formatCell(row.root_cause)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h2 className="text-sm font-semibold text-slate-900">Phiaccess Logs</h2>
        {phiaccessLogLinkedRows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No linked phiaccess logs.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {phiaccessLogLinkedRows.map((row) => (
              <li key={String(row.phi_access_log_id)}>
                <Link to={`/phiaccess-logs/${row.phi_access_log_id}`} className="block py-2 text-sm text-brand-600 hover:underline">
                  {formatCell(row.resource_id)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h2 className="text-sm font-semibold text-slate-900">Consent Records</h2>
        {consentRecordLinkedRows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No linked consent records.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {consentRecordLinkedRows.map((row) => (
              <li key={String(row.consent_record_id)}>
                <Link to={`/consent-records/${row.consent_record_id}`} className="block py-2 text-sm text-brand-600 hover:underline">
                  {formatCell(row.consent_record_id)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
