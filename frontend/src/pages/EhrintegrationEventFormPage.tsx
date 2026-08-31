import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import type { EhrintegrationEvent } from '../types/EhrintegrationEvent';
import { ehrintegrationEventService } from '../services/EhrintegrationEventService';
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
import { FileUploadField } from '../components/ui/FileUploadField';

type FormState = Record<string, unknown>;

function emptyForm(): FormState {
  return {
    source_system: '',
    direction: '',
    event_type: '',
    message_id: '',
    patient_id: '',
    appointment_id: '',
    status: '',
    error_message: '',
    retry_count: '',
    payload_file: '',
    occurred_at: '',
    processed_at: '',
    created_at: '',
  };
}

function omitKey<T extends Record<string, unknown>>(obj: T, key: string): Record<string, unknown> {
  const { [key]: _omitted, ...rest } = obj;
  return rest;
}

function toFormData(obj: Record<string, unknown>): FormData {
  const fd = new FormData();
  Object.entries(obj).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    fd.append(key, typeof value === 'boolean' ? String(value) : String(value));
  });
  return fd;
}

export function EhrintegrationEventFormPage() {
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
    ehrintegrationEventService.list()
      .then((rows) => {
        const found = rows.find((r) => String(r.ehr_integration_event_id) === String(id));
        if (found) setValues({ ...found });
      })
      .catch(() => toast.error('Failed to load Ehrintegration Event'))
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
    if (!values.source_system && values.source_system !== 0 && values.source_system !== false) nextErrors.source_system = "Source System is required";
    if (!values.direction && values.direction !== 0 && values.direction !== false) nextErrors.direction = "Direction is required";
    if (!values.event_type && values.event_type !== 0 && values.event_type !== false) nextErrors.event_type = "Event Type is required";
    if (!values.message_id && values.message_id !== 0 && values.message_id !== false) nextErrors.message_id = "Message Id is required";
    if (!values.status && values.status !== 0 && values.status !== false) nextErrors.status = "Status is required";
    if (!values.retry_count && values.retry_count !== 0 && values.retry_count !== false) nextErrors.retry_count = "Retry Count is required";
    if (!values.occurred_at && values.occurred_at !== 0 && values.occurred_at !== false) nextErrors.occurred_at = "Occurred At is required";
    if (!values.created_at && values.created_at !== 0 && values.created_at !== false) nextErrors.created_at = "Created At is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = omitKey(values, 'ehr_integration_event_id');
      if (isEdit) {
        await ehrintegrationEventService.uploadUpdate(id as never, toFormData(payload));
        toast.success('Ehrintegration Event updated successfully');
        navigate(`/ehrintegration-events/${id}`);
      } else {
        const created = (await ehrintegrationEventService.uploadCreate(toFormData(payload))) as EhrintegrationEvent;
        toast.success('Ehrintegration Event created successfully');
        navigate(`/ehrintegration-events/${created.ehr_integration_event_id}`);
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
        to={isEdit ? `/ehrintegration-events/${id}` : '/ehrintegration-events'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isEdit ? 'Edit Ehrintegration Event' : 'New Ehrintegration Event'}</h1>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEdit && (
          <>
        <TextField
          name="ehr_integration_event_id"
          label={"Ehr Integration Event Id"}
          value={String(values.ehr_integration_event_id ?? '')}
          onChange={(v) => set('ehr_integration_event_id', v)}
          required={false}
          error={errors.ehr_integration_event_id}
          disabled={true}
        />
          </>
        )}
        <SelectField
          name="source_system"
          label={"Source System"}
          value={String(values.source_system ?? '')}
          onChange={(v) => set('source_system', v)}
          options={['Epic', 'Cerner']}
          required={true}
          error={errors.source_system}
          disabled={false}
        />
        <SelectField
          name="direction"
          label={"Direction"}
          value={String(values.direction ?? '')}
          onChange={(v) => set('direction', v)}
          options={['Inbound', 'Outbound']}
          required={true}
          error={errors.direction}
          disabled={false}
        />
        <SelectField
          name="event_type"
          label={"Event Type"}
          value={String(values.event_type ?? '')}
          onChange={(v) => set('event_type', v)}
          options={['ADT', 'SIU (Schedule)', 'ORM (Order)', 'MDM (Document)', 'Patient Sync', 'Slot Sync']}
          required={true}
          error={errors.event_type}
          disabled={false}
        />
        <TextField
          name="message_id"
          label={"Message Id"}
          value={String(values.message_id ?? '')}
          onChange={(v) => set('message_id', v)}
          required={true}
          error={errors.message_id}
          disabled={false}
        />
        <FKSelectField
          name="patient_id"
          label={"Patient Id"}
          value={String(values.patient_id ?? '')}
          onChange={(v) => set('patient_id', v)}
          options={patient_idOptions}
          required={false}
          error={errors.patient_id}
          disabled={false}
        />
        <FKSelectField
          name="appointment_id"
          label={"Appointment Id"}
          value={String(values.appointment_id ?? '')}
          onChange={(v) => set('appointment_id', v)}
          options={appointment_idOptions}
          required={false}
          error={errors.appointment_id}
          disabled={false}
        />
        <SelectField
          name="status"
          label={"Status"}
          value={String(values.status ?? '')}
          onChange={(v) => set('status', v)}
          options={['Received', 'Processing', 'Succeeded', 'Failed', 'Retrying']}
          required={true}
          error={errors.status}
          disabled={false}
        />
        <TextField
          name="error_message"
          label={"Error Message"}
          value={String(values.error_message ?? '')}
          onChange={(v) => set('error_message', v)}
          required={false}
          error={errors.error_message}
          disabled={false}
        />
        <NumberField
          name="retry_count"
          label={"Retry Count"}
          value={typeof values.retry_count === 'number' ? values.retry_count : ''}
          onChange={(v) => set('retry_count', v)}
          required={true}
          error={errors.retry_count}
          disabled={false}
        />
        <FileUploadField
          name="payload_file"
          label={"Payload File"}
          value={String(values.payload_file ?? '')}
          fileLabel={values.payload_file ? "Payload File" : undefined}
          accept={['.pdf', '.jpg', '.jpeg', '.png']}
          maxSizeMb={10}
          required={false}
          error={errors.payload_file}
          disabled={false}
          downloadHref={values.payload_file ? String(values.payload_file) : undefined}
          onSelect={(file, dataUrl) => {
            const ext = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase() : '';
            if (!['.pdf', '.jpg', '.jpeg', '.png'].includes(ext)) {
              setErrors((prev) => ({ ...prev, payload_file: `File type not allowed. Allowed: ${['.pdf', '.jpg', '.jpeg', '.png'].join(', ')}` }));
              return;
            }
            if (file.size > 10 * 1024 * 1024) {
              setErrors((prev) => ({ ...prev, payload_file: 'File must be smaller than 10MB' }));
              return;
            }
            setErrors((prev) => {
              const next = { ...prev };
              delete next.payload_file;
              return next;
            });
            set('payload_file', dataUrl);
          }}
          onRemove={() => {
            set('payload_file', '');
          }}
        />
        <DateField
          name="occurred_at"
          label={"Occurred At"}
          value={toDateInputValue(values.occurred_at)}
          onChange={(v) => set('occurred_at', v)}
          required={true}
          error={errors.occurred_at}
          disabled={false}
        />
        <DateField
          name="processed_at"
          label={"Processed At"}
          value={toDateInputValue(values.processed_at)}
          onChange={(v) => set('processed_at', v)}
          required={false}
          error={errors.processed_at}
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
            {isEdit ? 'Save changes' : 'Create Ehrintegration Event'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
