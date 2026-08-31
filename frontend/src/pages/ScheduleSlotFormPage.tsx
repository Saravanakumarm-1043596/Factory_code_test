import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import type { ScheduleSlot } from '../types/ScheduleSlot';
import { scheduleSlotService } from '../services/ScheduleSlotService';
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
import { clinicianService } from '../services/ClinicianService';
import { facilityService } from '../services/FacilityService';
import { appointmentService } from '../services/AppointmentService';

type FormState = Record<string, unknown>;

function emptyForm(): FormState {
  return {
    clinician_id: '',
    facility_id: '',
    slot_start: '',
    slot_end: '',
    slot_type: '',
    status: '',
    appointment_id: '',
    demand_score: '',
    created_at: '',
  };
}

function omitKey<T extends Record<string, unknown>>(obj: T, key: string): Record<string, unknown> {
  const { [key]: _omitted, ...rest } = obj;
  return rest;
}

export function ScheduleSlotFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [values, setValues] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [clinician_idOptions, setClinician_idOptions] = useState<FKOption[]>([]);
  const [facility_idOptions, setFacility_idOptions] = useState<FKOption[]>([]);
  const [appointment_idOptions, setAppointment_idOptions] = useState<FKOption[]>([]);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    scheduleSlotService.list()
      .then((rows) => {
        const found = rows.find((r) => String(r.schedule_slot_id) === String(id));
        if (found) setValues({ ...found });
      })
      .catch(() => toast.error('Failed to load Schedule Slot'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

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
    if (!values.clinician_id && values.clinician_id !== 0 && values.clinician_id !== false) nextErrors.clinician_id = "Clinician Id is required";
    if (!values.facility_id && values.facility_id !== 0 && values.facility_id !== false) nextErrors.facility_id = "Facility Id is required";
    if (!values.slot_start && values.slot_start !== 0 && values.slot_start !== false) nextErrors.slot_start = "Slot Start is required";
    if (!values.slot_end && values.slot_end !== 0 && values.slot_end !== false) nextErrors.slot_end = "Slot End is required";
    if (!values.slot_type && values.slot_type !== 0 && values.slot_type !== false) nextErrors.slot_type = "Slot Type is required";
    if (!values.status && values.status !== 0 && values.status !== false) nextErrors.status = "Status is required";
    if (!values.created_at && values.created_at !== 0 && values.created_at !== false) nextErrors.created_at = "Created At is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = omitKey(values, 'schedule_slot_id');
      if (isEdit) {
        await scheduleSlotService.update(id as never, payload as never);
        toast.success('Schedule Slot updated successfully');
        navigate(`/schedule-slots/${id}`);
      } else {
        const created = (await scheduleSlotService.create(payload as never)) as ScheduleSlot;
        toast.success('Schedule Slot created successfully');
        navigate(`/schedule-slots/${created.schedule_slot_id}`);
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
        to={isEdit ? `/schedule-slots/${id}` : '/schedule-slots'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isEdit ? 'Edit Schedule Slot' : 'New Schedule Slot'}</h1>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEdit && (
          <>
        <TextField
          name="schedule_slot_id"
          label={"Schedule Slot Id"}
          value={String(values.schedule_slot_id ?? '')}
          onChange={(v) => set('schedule_slot_id', v)}
          required={false}
          error={errors.schedule_slot_id}
          disabled={true}
        />
          </>
        )}
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
        <DateField
          name="slot_start"
          label={"Slot Start"}
          value={toDateInputValue(values.slot_start)}
          onChange={(v) => set('slot_start', v)}
          required={true}
          error={errors.slot_start}
          disabled={false}
        />
        <DateField
          name="slot_end"
          label={"Slot End"}
          value={toDateInputValue(values.slot_end)}
          onChange={(v) => set('slot_end', v)}
          required={true}
          error={errors.slot_end}
          disabled={false}
        />
        <SelectField
          name="slot_type"
          label={"Slot Type"}
          value={String(values.slot_type ?? '')}
          onChange={(v) => set('slot_type', v)}
          options={['Standard', 'Overbook', 'Walk-In', 'Telehealth Only', 'Blocked']}
          required={true}
          error={errors.slot_type}
          disabled={false}
        />
        <SelectField
          name="status"
          label={"Status"}
          value={String(values.status ?? '')}
          onChange={(v) => set('status', v)}
          options={['Available', 'Booked', 'Blocked', 'Completed']}
          required={true}
          error={errors.status}
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
        <NumberField
          name="demand_score"
          label={"Demand Score"}
          value={typeof values.demand_score === 'number' ? values.demand_score : ''}
          onChange={(v) => set('demand_score', v)}
          required={false}
          error={errors.demand_score}
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
            {isEdit ? 'Save changes' : 'Create Schedule Slot'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
