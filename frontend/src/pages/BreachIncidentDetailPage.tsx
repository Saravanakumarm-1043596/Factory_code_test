import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, Pencil as PencilIcon, Download as DownloadIcon } from 'lucide-react';
import type { BreachIncident } from '../types/BreachIncident';
import type { AppUser } from '../types/AppUser';
import { breachIncidentService } from '../services/BreachIncidentService';
import { appUserService } from '../services/AppUserService';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { formatCell } from '../lib/format';

export function BreachIncidentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<BreachIncident | null>(null);
  const [loading, setLoading] = useState(true);
  const [reported_by_user_idTarget, setReported_by_user_idTarget] = useState<AppUser | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await breachIncidentService.list();
      setRecord(rows.find((r) => String(r.breach_incident_id) === String(id)) ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Breach Incident');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [id]);

  useEffect(() => {
    const fkValue: unknown = record ? record.reported_by_user_id : null;
    if (fkValue === null || fkValue === undefined || fkValue === '') {
      setReported_by_user_idTarget(null);
      return;
    }
    appUserService.getById(fkValue as string | number)
      .then((row) => setReported_by_user_idTarget(row ?? null))
      .catch(() => setReported_by_user_idTarget(null));
  }, [record]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-md border border-slate-200 bg-white p-3.5" />;
  }

  if (!record) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-3.5 text-center text-sm text-slate-500">
        Breach Incident not found.
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => navigate('/breach-incidents')}>
            Back to Breach Incidents
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/breach-incidents')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Breach Incidents
        </button>
        <Button icon={<PencilIcon className="h-4 w-4" />} onClick={() => navigate('/breach-incidents/' + id + '/edit')}>
          Edit
        </Button>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h1 className="text-lg font-semibold text-slate-900">{formatCell(record.root_cause)}</h1>
        <p className="mt-1 text-sm text-slate-500">Breach Incident details</p>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Breach Incident Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.breach_incident_id)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Reported By User Id</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {reported_by_user_idTarget ? (
                <Link to={`/app-users/${record.reported_by_user_id}`} className="text-brand-600 hover:underline">
                  {`${reported_by_user_idTarget.first_name}`}
                </Link>
              ) : (
                formatCell(record.reported_by_user_id)
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Severity</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.severity)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Breach Type</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.breach_type)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.status)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Affected Patient Count</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.affected_patient_count)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Description</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.description)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Discovered At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.discovered_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Reported At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.reported_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Hhs Notification Deadline</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.hhs_notification_deadline)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Hhs Notified At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.hhs_notified_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Patient Notification Sent At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.patient_notification_sent_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Root Cause</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.root_cause)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Remediation Plan</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.remediation_plan)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Supporting Document</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {record.supporting_document ? (
                <a href={String(record.supporting_document)} download className="inline-flex items-center gap-1 text-brand-600 hover:underline">
                  <DownloadIcon className="h-3.5 w-3.5" /> Download
                </a>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Resolved At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.resolved_at)}</dd>
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
