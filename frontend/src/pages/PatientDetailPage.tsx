import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, Pencil as PencilIcon, Download as DownloadIcon } from 'lucide-react';
import type { Patient } from '../types/Patient';
import type { Appointment } from '../types/Appointment';
import type { PatientEngagement } from '../types/PatientEngagement';
import type { PhiaccessLog } from '../types/PhiaccessLog';
import type { ConsentRecord } from '../types/ConsentRecord';
import type { EhrintegrationEvent } from '../types/EhrintegrationEvent';
import { patientService } from '../services/PatientService';
import { appointmentService } from '../services/AppointmentService';
import { patientEngagementService } from '../services/PatientEngagementService';
import { phiaccessLogService } from '../services/PhiaccessLogService';
import { consentRecordService } from '../services/ConsentRecordService';
import { ehrintegrationEventService } from '../services/EhrintegrationEventService';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { formatCell } from '../lib/format';

export function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [appointmentLinkedRows, setAppointmentLinkedRows] = useState<Appointment[]>([]);
  const [patientEngagementLinkedRows, setPatientEngagementLinkedRows] = useState<PatientEngagement[]>([]);
  const [phiaccessLogLinkedRows, setPhiaccessLogLinkedRows] = useState<PhiaccessLog[]>([]);
  const [consentRecordLinkedRows, setConsentRecordLinkedRows] = useState<ConsentRecord[]>([]);
  const [ehrintegrationEventLinkedRows, setEhrintegrationEventLinkedRows] = useState<EhrintegrationEvent[]>([]);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await patientService.list();
      setRecord(rows.find((r) => String(r.patient_id) === String(id)) ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Patient');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [id]);

  useEffect(() => {
    if (!record) return;
    appointmentService.list()
      .then((rows) => setAppointmentLinkedRows(rows.filter((r) => String(r.patient_id) === String(record.patient_id))))
      .catch(() => setAppointmentLinkedRows([]));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    patientEngagementService.list()
      .then((rows) => setPatientEngagementLinkedRows(rows.filter((r) => String(r.patient_id) === String(record.patient_id))))
      .catch(() => setPatientEngagementLinkedRows([]));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    phiaccessLogService.list()
      .then((rows) => setPhiaccessLogLinkedRows(rows.filter((r) => String(r.patient_id) === String(record.patient_id))))
      .catch(() => setPhiaccessLogLinkedRows([]));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    consentRecordService.list()
      .then((rows) => setConsentRecordLinkedRows(rows.filter((r) => String(r.patient_id) === String(record.patient_id))))
      .catch(() => setConsentRecordLinkedRows([]));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    ehrintegrationEventService.list()
      .then((rows) => setEhrintegrationEventLinkedRows(rows.filter((r) => String(r.patient_id) === String(record.patient_id))))
      .catch(() => setEhrintegrationEventLinkedRows([]));
  }, [record]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-md border border-slate-200 bg-white p-3.5" />;
  }

  if (!record) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-3.5 text-center text-sm text-slate-500">
        Patient not found.
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => navigate('/patients')}>
            Back to Patients
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/patients')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Patients
        </button>
        <Button icon={<PencilIcon className="h-4 w-4" />} onClick={() => navigate('/patients/' + id + '/edit')}>
          Edit
        </Button>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h1 className="text-lg font-semibold text-slate-900">{formatCell(record.first_name)}</h1>
        <p className="mt-1 text-sm text-slate-500">Patient details</p>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Patient Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.patient_id)}</dd>
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
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Date Of Birth</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.date_of_birth)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Gender</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.gender)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.email)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Phone Number</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.phone_number)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Preferred Contact Method</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.preferred_contact_method)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Preferred Language</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.preferred_language)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Membership Status</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.membership_status)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Ehr Source System</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.ehr_source_system)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Ehr Medical Record Number</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.ehr_medical_record_number)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">No Show Risk Score</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.no_show_risk_score)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Risk Score Updated At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.risk_score_updated_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Enrollment Date</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.enrollment_date)}</dd>
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
        <h2 className="text-sm font-semibold text-slate-900">Appointments</h2>
        {appointmentLinkedRows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No linked appointments.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {appointmentLinkedRows.map((row) => (
              <li key={String(row.appointment_id)}>
                <Link to={`/appointments/${row.appointment_id}`} className="block py-2 text-sm text-brand-600 hover:underline">
                  {formatCell(row.appointment_id)}
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
