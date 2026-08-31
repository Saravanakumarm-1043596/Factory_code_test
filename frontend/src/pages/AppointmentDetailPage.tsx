import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, Pencil as PencilIcon } from 'lucide-react';
import type { Appointment } from '../types/Appointment';
import type { Patient } from '../types/Patient';
import type { Clinician } from '../types/Clinician';
import type { Facility } from '../types/Facility';
import type { ScheduleSlot } from '../types/ScheduleSlot';
import type { PatientEngagement } from '../types/PatientEngagement';
import type { EhrintegrationEvent } from '../types/EhrintegrationEvent';
import { appointmentService } from '../services/AppointmentService';
import { patientService } from '../services/PatientService';
import { clinicianService } from '../services/ClinicianService';
import { facilityService } from '../services/FacilityService';
import { scheduleSlotService } from '../services/ScheduleSlotService';
import { patientEngagementService } from '../services/PatientEngagementService';
import { ehrintegrationEventService } from '../services/EhrintegrationEventService';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { formatCell } from '../lib/format';

export function AppointmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [patient_idTarget, setPatient_idTarget] = useState<Patient | null>(null);
  const [clinician_idTarget, setClinician_idTarget] = useState<Clinician | null>(null);
  const [facility_idTarget, setFacility_idTarget] = useState<Facility | null>(null);
  const [scheduleSlotLinkedRows, setScheduleSlotLinkedRows] = useState<ScheduleSlot[]>([]);
  const [patientEngagementLinkedRows, setPatientEngagementLinkedRows] = useState<PatientEngagement[]>([]);
  const [ehrintegrationEventLinkedRows, setEhrintegrationEventLinkedRows] = useState<EhrintegrationEvent[]>([]);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await appointmentService.list();
      setRecord(rows.find((r) => String(r.appointment_id) === String(id)) ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Appointment');
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
    scheduleSlotService.list()
      .then((rows) => setScheduleSlotLinkedRows(rows.filter((r) => String(r.appointment_id) === String(record.appointment_id))))
      .catch(() => setScheduleSlotLinkedRows([]));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    patientEngagementService.list()
      .then((rows) => setPatientEngagementLinkedRows(rows.filter((r) => String(r.appointment_id) === String(record.appointment_id))))
      .catch(() => setPatientEngagementLinkedRows([]));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    ehrintegrationEventService.list()
      .then((rows) => setEhrintegrationEventLinkedRows(rows.filter((r) => String(r.appointment_id) === String(record.appointment_id))))
      .catch(() => setEhrintegrationEventLinkedRows([]));
  }, [record]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-md border border-slate-200 bg-white p-3.5" />;
  }

  if (!record) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-3.5 text-center text-sm text-slate-500">
        Appointment not found.
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => navigate('/appointments')}>
            Back to Appointments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/appointments')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Appointments
        </button>
        <Button icon={<PencilIcon className="h-4 w-4" />} onClick={() => navigate('/appointments/' + id + '/edit')}>
          Edit
        </Button>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h1 className="text-lg font-semibold text-slate-900">{formatCell(record.appointment_id)}</h1>
        <p className="mt-1 text-sm text-slate-500">Appointment details</p>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Appointment Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.appointment_id)}</dd>
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
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Appointment Type</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.appointment_type)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Visit Reason</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.visit_reason)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Scheduled Datetime</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.scheduled_datetime)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Duration Minutes</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.duration_minutes)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.status)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">No Show Risk Score</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.no_show_risk_score)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Predicted Optimal Slot</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.predicted_optimal_slot)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Ehr Source System</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.ehr_source_system)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Ehr Encounter Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.ehr_encounter_id)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Cancellation Reason</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.cancellation_reason)}</dd>
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
        <h2 className="text-sm font-semibold text-slate-900">Schedule Slots</h2>
        {scheduleSlotLinkedRows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No linked schedule slots.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {scheduleSlotLinkedRows.map((row) => (
              <li key={String(row.schedule_slot_id)}>
                <Link to={`/schedule-slots/${row.schedule_slot_id}`} className="block py-2 text-sm text-brand-600 hover:underline">
                  {formatCell(row.schedule_slot_id)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h2 className="text-sm font-semibold text-slate-900">Patient Engagements</h2>
        {patientEngagementLinkedRows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No linked patient engagements.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {patientEngagementLinkedRows.map((row) => (
              <li key={String(row.patient_engagement_id)}>
                <Link to={`/patient-engagements/${row.patient_engagement_id}`} className="block py-2 text-sm text-brand-600 hover:underline">
                  {formatCell(row.template_name)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h2 className="text-sm font-semibold text-slate-900">Ehrintegration Events</h2>
        {ehrintegrationEventLinkedRows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No linked ehrintegration events.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {ehrintegrationEventLinkedRows.map((row) => (
              <li key={String(row.ehr_integration_event_id)}>
                <Link to={`/ehrintegration-events/${row.ehr_integration_event_id}`} className="block py-2 text-sm text-brand-600 hover:underline">
                  {formatCell(row.message_id)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
