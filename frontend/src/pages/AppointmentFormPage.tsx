import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import type { Appointment } from '../types/Appointment';
import { appointmentService } from '../services/AppointmentService';
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
import { clinicianService } from '../services/ClinicianService';
import { facilityService } from '../services/FacilityService';

type FormState = Record<string, unknown>;

function emptyForm(): FormState {
  return {
    patient_id: '',
    clinician_id: '',
    facility_id: '',
    appointment_type: '',
    visit_reason: '',
    scheduled_datetime: '',
    duration_minutes: '',
    status: '',
    no_show_risk_score: '',
    predicted_optimal_slot: '',
    ehr_source_system: '',
    ehr_encounter_id: '',
    cancellation_reason: '',
    notes: '',
    created_at: '',
    updated_at: '',
  };
}

function omitKey<T extends Record<string, unknown>>(obj: T, key: string): Record<string, unknown> {
  const { [key]: _omitted, ...rest } = obj;
  return rest;
}

export function AppointmentFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [values, setValues] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [patient_idOptions, setPatient_idOptions] = useState<FKOption[]>([]);
  const [clinician_idOptions, setClinician_idOptions] = useState<FKOption[]>([]);
  const [facility_idOptions, setFacility_idOptions] = useState<FKOption[]>([]);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    appointmentService.list()
      .then((rows) => {
        const found = rows.find((r) => String(r.appointment_id) === String(id));
        if (found) setValues({ ...found });
      })
      .catch(() => toast.error('Failed to load Appointment'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  useEffect(() => {
    patientService.list()
      .then((rows) => setPatient_idOptions(rows.map((r) => ({ value: String(r.patient_id), label: `${r.first_name}` }))))
      .catch(() => setPatient_idOptions([]));
  }, []);

  useEffect(() => {
    clinicianService.list()
      .then((rows) => setClinician_idOptions(rows.map((r) => ({ value: String(r.clinician_id), label: `${r.first_name}` }))))
      .catch(() => setClinician_idOptions([]));
  }, []);

  useEffect(() => {
    facilityService.list()
      .then((rows) => setFacility_idOptions(rows.map((r) => ({ value: String(r.facility_id), label: `${r.name}` }))))
      .catch(() => setFacility_idOptions([]));
  }, []);

  function set(name: string, value: unknown) {
    setValues((s) => ({ ...s, [name]: value }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!values.patient_id && values.patient_id !== 0 && values.patient_id !== false) nextErrors.patient_id = "Patient Id is required";
    if (!values.clinician_id && values.clinician_id !== 0 && values.clinician_id !== false) nextErrors.clinician_id = "Clinician Id is required";
    if (!values.facility_id && values.facility_id !== 0 && values.facility_id !== false) nextErrors.facility_id = "Facility Id is required";
    if (!values.appointment_type && values.appointment_type !== 0 && values.appointment_type !== false) nextErrors.appointment_type = "Appointment Type is required";
    if (!values.visit_reason && values.visit_reason !== 0 && values.visit_reason !== false) nextErrors.visit_reason = "Visit Reason is required";
    if (!values.scheduled_datetime && values.scheduled_datetime !== 0 && values.scheduled_datetime !== false) nextErrors.scheduled_datetime = "Scheduled Datetime is required";
    if (!values.duration_minutes && values.duration_minutes !== 0 && values.duration_minutes !== false) nextErrors.duration_minutes = "Duration Minutes is required";
    if (!values.status && values.status !== 0 && values.status !== false) nextErrors.status = "Status is required";
    if (!values.ehr_source_system && values.ehr_source_system !== 0 && values.ehr_source_system !== false) nextErrors.ehr_source_system = "Ehr Source System is required";
    if (!values.created_at && values.created_at !== 0 && values.created_at !== false) nextErrors.created_at = "Created At is required";
    if (!values.updated_at && values.updated_at !== 0 && values.updated_at !== false) nextErrors.updated_at = "Updated At is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = omitKey(values, 'appointment_id');
      if (isEdit) {
        await appointmentService.update(id as never, payload as never);
        toast.success('Appointment updated successfully');
        navigate(`/appointments/${id}`);
      } else {
        const created = (await appointmentService.create(payload as never)) as Appointment;
        toast.success('Appointment created successfully');
        navigate(`/appointments/${created.appointment_id}`);
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
        to={isEdit ? `/appointments/${id}` : '/appointments'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isEdit ? 'Edit Appointment' : 'New Appointment'}</h1>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEdit && (
          <>
        <SelectField
          name="appointment_id"
          label={"Appointment Id"}
          value={String(values.appointment_id ?? '')}
          onChange={(v) => set('appointment_id', v)}
          options={['New Patient', 'Follow Up', 'Annual Physical', 'Procedure', 'Consultation']}
          required={false}
          error={errors.appointment_id}
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
          name="clinician_id"
          label={"Clinician Id"}
          value={String(values.clinician_id ?? '')}
          onChange={(v) => set('clinician_id', v)}
          options={clinician_idOptions}
          required={true}
          error={errors.clinician_id}
          disabled={false}
        />
        <FKSelectField
          name="facility_id"
          label={"Facility Id"}
          value={String(values.facility_id ?? '')}
          onChange={(v) => set('facility_id', v)}
          options={facility_idOptions}
          required={true}
          error={errors.facility_id}
          disabled={false}
        />
        <SelectField
          name="appointment_type"
          label={"Appointment Type"}
          value={String(values.appointment_type ?? '')}
          onChange={(v) => set('appointment_type', v)}
          options={['In-Person', 'Telehealth', 'Phone', 'Home Visit']}
          required={true}
          error={errors.appointment_type}
          disabled={false}
        />
        <SelectField
          name="visit_reason"
          label={"Visit Reason"}
          value={String(values.visit_reason ?? '')}
          onChange={(v) => set('visit_reason', v)}
          options={['New Patient', 'Follow-Up', 'Annual Wellness', 'Urgent', 'Procedure', 'Lab Review', 'Referral']}
          required={true}
          error={errors.visit_reason}
          disabled={false}
        />
        <DateField
          name="scheduled_datetime"
          label={"Scheduled Datetime"}
          value={toDateInputValue(values.scheduled_datetime)}
          onChange={(v) => set('scheduled_datetime', v)}
          required={true}
          error={errors.scheduled_datetime}
          disabled={false}
        />
        <NumberField
          name="duration_minutes"
          label={"Duration Minutes"}
          value={typeof values.duration_minutes === 'number' ? values.duration_minutes : ''}
          onChange={(v) => set('duration_minutes', v)}
          required={true}
          error={errors.duration_minutes}
          disabled={false}
        />
        <SelectField
          name="status"
          label={"Status"}
          value={String(values.status ?? '')}
          onChange={(v) => set('status', v)}
          options={['Scheduled', 'Confirmed', 'Checked In', 'In Progress', 'Completed', 'No-Show', 'Cancelled', 'Rescheduled']}
          required={true}
          error={errors.status}
          disabled={false}
        />
        <NumberField
          name="no_show_risk_score"
          label={"No Show Risk Score"}
          value={typeof values.no_show_risk_score === 'number' ? values.no_show_risk_score : ''}
          onChange={(v) => set('no_show_risk_score', v)}
          required={false}
          error={errors.no_show_risk_score}
          disabled={false}
        />
        <DateField
          name="predicted_optimal_slot"
          label={"Predicted Optimal Slot"}
          value={toDateInputValue(values.predicted_optimal_slot)}
          onChange={(v) => set('predicted_optimal_slot', v)}
          required={false}
          error={errors.predicted_optimal_slot}
          disabled={false}
        />
        <SelectField
          name="ehr_source_system"
          label={"Ehr Source System"}
          value={String(values.ehr_source_system ?? '')}
          onChange={(v) => set('ehr_source_system', v)}
          options={['Epic', 'Cerner']}
          required={true}
          error={errors.ehr_source_system}
          disabled={false}
        />
        <SelectField
          name="ehr_encounter_id"
          label={"Ehr Encounter Id"}
          value={String(values.ehr_encounter_id ?? '')}
          onChange={(v) => set('ehr_encounter_id', v)}
          options={['Office Visit', 'Telehealth', 'Inpatient', 'Emergency', 'Follow Up']}
          required={false}
          error={errors.ehr_encounter_id}
          disabled={false}
        />
        <SelectField
          name="cancellation_reason"
          label={"Cancellation Reason"}
          value={String(values.cancellation_reason ?? '')}
          onChange={(v) => set('cancellation_reason', v)}
          options={['Patient Request', 'Clinician Unavailable', 'Insurance Issue', 'Weather', 'No Reason Given', 'System Rescheduled']}
          required={false}
          error={errors.cancellation_reason}
          disabled={false}
        />
        <TextAreaField
          name="notes"
          label={"Notes"}
          value={String(values.notes ?? '')}
          onChange={(v) => set('notes', v)}
          required={false}
          error={errors.notes}
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
        <DateField
          name="updated_at"
          label={"Updated At"}
          value={toDateInputValue(values.updated_at)}
          onChange={(v) => set('updated_at', v)}
          required={true}
          error={errors.updated_at}
          disabled={false}
        />
        </div>
        <div className="mt-6 flex gap-3">
          <Button onClick={handleSubmit} loading={submitting}>
            {isEdit ? 'Save changes' : 'Create Appointment'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
