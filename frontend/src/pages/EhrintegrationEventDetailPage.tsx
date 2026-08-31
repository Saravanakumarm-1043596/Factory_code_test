import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, Pencil as PencilIcon, Download as DownloadIcon } from 'lucide-react';
import type { EhrintegrationEvent } from '../types/EhrintegrationEvent';
import type { Patient } from '../types/Patient';
import type { Appointment } from '../types/Appointment';
import { ehrintegrationEventService } from '../services/EhrintegrationEventService';
import { patientService } from '../services/PatientService';
import { appointmentService } from '../services/AppointmentService';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { formatCell } from '../lib/format';

export function EhrintegrationEventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<EhrintegrationEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [patient_idTarget, setPatient_idTarget] = useState<Patient | null>(null);
  const [appointment_idTarget, setAppointment_idTarget] = useState<Appointment | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await ehrintegrationEventService.list();
      setRecord(rows.find((r) => String(r.ehr_integration_event_id) === String(id)) ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Ehrintegration Event');
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
    const fkValue: unknown = record ? record.appointment_id : null;
    if (fkValue === null || fkValue === undefined || fkValue === '') {
      setAppointment_idTarget(null);
      return;
    }
    appointmentService.getById(fkValue as string | number)
      .then((row) => setAppointment_idTarget(row ?? null))
      .catch(() => setAppointment_idTarget(null));
  }, [record]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-md border border-slate-200 bg-white p-3.5" />;
  }

  if (!record) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-3.5 text-center text-sm text-slate-500">
        Ehrintegration Event not found.
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => navigate('/ehrintegration-events')}>
            Back to Ehrintegration Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/ehrintegration-events')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Ehrintegration Events
        </button>
        <Button icon={<PencilIcon className="h-4 w-4" />} onClick={() => navigate('/ehrintegration-events/' + id + '/edit')}>
          Edit
        </Button>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h1 className="text-lg font-semibold text-slate-900">{formatCell(record.message_id)}</h1>
        <p className="mt-1 text-sm text-slate-500">Ehrintegration Event details</p>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Ehr Integration Event Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.ehr_integration_event_id)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Source System</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.source_system)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Direction</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.direction)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Event Type</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.event_type)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Message Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.message_id)}</dd>
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
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Appointment Id</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {appointment_idTarget ? (
                <Link to={`/appointments/${record.appointment_id}`} className="text-brand-600 hover:underline">
                  {`#${appointment_idTarget.appointment_id}`}
                </Link>
              ) : (
                formatCell(record.appointment_id)
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.status)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Error Message</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.error_message)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Retry Count</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.retry_count)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Payload File</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {record.payload_file ? (
                <a href={String(record.payload_file)} download className="inline-flex items-center gap-1 text-brand-600 hover:underline">
                  <DownloadIcon className="h-3.5 w-3.5" /> Download
                </a>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Occurred At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.occurred_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Processed At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.processed_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Created At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.created_at)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
