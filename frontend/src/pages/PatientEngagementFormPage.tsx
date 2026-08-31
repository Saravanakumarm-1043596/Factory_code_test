import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import type { PatientEngagement } from '../types/PatientEngagement';
import { patientEngagementService } from '../services/PatientEngagementService';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { toDateInputValue } from '../lib/format';
import {
  TextField,
  NumberField,
  DateField,
  SelectField,
  TextAreaField,
  CheckboxField,
  FKSelectField,
  type FKOption,
} from '../components/ui/FormFields';
import { patientService } from '../services/PatientService';
import { appointmentService } from '../services/AppointmentService';

type FormState = Record<string, unknown>;

function emptyForm(): FormState {
  return {
    patient_id: '',
    appointment_id: '',
    channel: '',
    engagement_type: '',
    sent_at: '',
    delivered_at: '',
    patient_response: '',
    response_at: '',
    status: '',
    template_name: '',
    created_at: '',
  };
}

function omitKey<T extends Record<string, unknown>>(obj: T, key: string): Record<string, unknown> {
  const { [key]: _omitted, ...rest } = obj;
  return rest;
}

export function PatientEngagementFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [values, setValues] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [patient_idOptions, setPatient_idOptions] = useState<FKOption[]>([]);
  const [appointment_idOptions, setAppointment_idOptions] = useState<FKOption[]>([]);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    patientEngagementService.list()
      .then((rows) => {
        const found = rows.find((r) => String(r.patient_engagement_id) === String(id));
        if (found) setValues({ ...found });
      })
      .catch(() => toast.error('Failed to load Patient Engagement'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  useEffect(() => {
    patientService.list()
      .then((rows) => setPatient_idOptions(rows.map((r) => ({ value: String(r.patient_id), label: `${r.first_name}` }))))
      .catch(() => setPatient_idOptions([]));
  }, []);

  useEffect(() => {
    appointmentService.list()
      .then((rows) => setAppointment_idOptions(rows.map((r) => ({ value: String(r.appointment_id), label: `#${r.appointment_id}` }))))
      .catch(() => setAppointment_idOptions([]));
  }, []);

  function set(name: string, value: unknown) {
    setValues((s) => ({ ...s, [name]: value }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!values.patient_id && values.patient_id !== 0 && values.patient_id !== false) nextErrors.patient_id = "Patient Id is required";
    if (!values.appointment_id && values.appointment_id !== 0 && values.appointment_id !== false) nextErrors.appointment_id = "Appointment Id is required";
    if (!values.channel && values.channel !== 0 && values.channel !== false) nextErrors.channel = "Channel is required";
    if (!values.engagement_type && values.engagement_type !== 0 && values.engagement_type !== false) nextErrors.engagement_type = "Engagement Type is required";
    if (!values.sent_at && values.sent_at !== 0 && values.sent_at !== false) nextErrors.sent_at = "Sent At is required";
    if (!values.status && values.status !== 0 && values.status !== false) nextErrors.status = "Status is required";
    if (!values.template_name && values.template_name !== 0 && values.template_name !== false) nextErrors.template_name = "Template Name is required";
    if (!values.created_at && values.created_at !== 0 && values.created_at !== false) nextErrors.created_at = "Created At is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = omitKey(values, 'patient_engagement_id');
      if (isEdit) {
        await patientEngagementService.update(id as never, payload as never);
        toast.success('Patient Engagement updated successfully');
        navigate(`/patient-engagements/${id}`);
      } else {
        const created = (await patientEngagementService.create(payload as never)) as PatientEngagement;
        toast.success('Patient Engagement created successfully');
        navigate(`/patient-engagements/${created.patient_engagement_id}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="h-64 animate-pulse rounded-md border border-slate-200 bg-white p-3.5" />;
  }

  return (
    <div>
      <Link
        to={isEdit ? `/patient-engagements/${id}` : '/patient-engagements'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isEdit ? 'Edit Patient Engagement' : 'New Patient Engagement'}</h1>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEdit && (
          <>
        <TextField
          name="patient_engagement_id"
          label={"Patient Engagement Id"}
          value={String(values.patient_engagement_id ?? '')}
          onChange={(v) => set('patient_engagement_id', v)}
          required={false}
          error={errors.patient_engagement_id}
          disabled={true}
        />
          </>
        )}
        <FKSelectField
          name="patient_id"
          label={"Patient Id"}
          value={String(values.patient_id ?? '')}
          onChange={(v) => set('patient_id', v)}
          options={patient_idOptions}
          required={true}
          error={errors.patient_id}
          disabled={false}
        />
        <FKSelectField
          name="appointment_id"
          label={"Appointment Id"}
          value={String(values.appointment_id ?? '')}
          onChange={(v) => set('appointment_id', v)}
          options={appointment_idOptions}
          required={true}
          error={errors.appointment_id}
          disabled={false}
        />
        <SelectField
          name="channel"
          label={"Channel"}
          value={String(values.channel ?? '')}
          onChange={(v) => set('channel', v)}
          options={['SMS', 'Email', 'Phone Call', 'Push Notification', 'Patient Portal', 'IVR']}
          required={true}
          error={errors.channel}
          disabled={false}
        />
        <SelectField
          name="engagement_type"
          label={"Engagement Type"}
          value={String(values.engagement_type ?? '')}
          onChange={(v) => set('engagement_type', v)}
          options={['Reminder', 'Confirmation Request', 'Reschedule Offer', 'Pre-Visit Instructions', 'Post-Visit Follow-Up', 'No-Show Outreach', 'Survey']}
          required={true}
          error={errors.engagement_type}
          disabled={false}
        />
        <DateField
          name="sent_at"
          label={"Sent At"}
          value={toDateInputValue(values.sent_at)}
          onChange={(v) => set('sent_at', v)}
          required={true}
          error={errors.sent_at}
          disabled={false}
        />
        <DateField
          name="delivered_at"
          label={"Delivered At"}
          value={toDateInputValue(values.delivered_at)}
          onChange={(v) => set('delivered_at', v)}
          required={false}
          error={errors.delivered_at}
          disabled={false}
        />
        <SelectField
          name="patient_response"
          label={"Patient Response"}
          value={String(values.patient_response ?? '')}
          onChange={(v) => set('patient_response', v)}
          options={['Confirmed', 'Rescheduled', 'Cancelled', 'No Response', 'Opted Out']}
          required={false}
          error={errors.patient_response}
          disabled={false}
        />
        <DateField
          name="response_at"
          label={"Response At"}
          value={toDateInputValue(values.response_at)}
          onChange={(v) => set('response_at', v)}
          required={false}
          error={errors.response_at}
          disabled={false}
        />
        <SelectField
          name="status"
          label={"Status"}
          value={String(values.status ?? '')}
          onChange={(v) => set('status', v)}
          options={['Pending', 'Sent', 'Delivered', 'Failed', 'Responded']}
          required={true}
          error={errors.status}
          disabled={false}
        />
        <TextField
          name="template_name"
          label={"Template Name"}
          value={String(values.template_name ?? '')}
          onChange={(v) => set('template_name', v)}
          required={true}
          error={errors.template_name}
          disabled={false}
        />
        <DateField
          name="created_at"
          label={"Created At"}
          value={toDateInputValue(values.created_at)}
          onChange={(v) => set('created_at', v)}
          required={true}
          error={errors.created_at}
          disabled={false}
        />
        </div>
        <div className="mt-6 flex gap-3">
          <Button onClick={handleSubmit} loading={submitting}>
            {isEdit ? 'Save changes' : 'Create Patient Engagement'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
