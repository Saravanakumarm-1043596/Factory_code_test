import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import type { Clinician } from '../types/Clinician';
import { clinicianService } from '../services/ClinicianService';
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
import { facilityService } from '../services/FacilityService';

type FormState = Record<string, unknown>;

function emptyForm(): FormState {
  return {
    first_name: '',
    last_name: '',
    email: '',
    npi_number: '',
    specialty: '',
    ehr_source_system: '',
    facility_id: '',
    status: '',
    max_daily_appointments: '',
    created_at: '',
    updated_at: '',
  };
}

function omitKey<T extends Record<string, unknown>>(obj: T, key: string): Record<string, unknown> {
  const { [key]: _omitted, ...rest } = obj;
  return rest;
}

export function ClinicianFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [values, setValues] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [facility_idOptions, setFacility_idOptions] = useState<FKOption[]>([]);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    clinicianService.list()
      .then((rows) => {
        const found = rows.find((r) => String(r.clinician_id) === String(id));
        if (found) setValues({ ...found });
      })
      .catch(() => toast.error('Failed to load Clinician'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

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
    if (!values.first_name && values.first_name !== 0 && values.first_name !== false) nextErrors.first_name = "First Name is required";
    if (!values.last_name && values.last_name !== 0 && values.last_name !== false) nextErrors.last_name = "Last Name is required";
    if (!values.email && values.email !== 0 && values.email !== false) nextErrors.email = "Email is required";
    if (!values.npi_number && values.npi_number !== 0 && values.npi_number !== false) nextErrors.npi_number = "Npi Number is required";
    if (!values.specialty && values.specialty !== 0 && values.specialty !== false) nextErrors.specialty = "Specialty is required";
    if (!values.ehr_source_system && values.ehr_source_system !== 0 && values.ehr_source_system !== false) nextErrors.ehr_source_system = "Ehr Source System is required";
    if (!values.facility_id && values.facility_id !== 0 && values.facility_id !== false) nextErrors.facility_id = "Facility Id is required";
    if (!values.status && values.status !== 0 && values.status !== false) nextErrors.status = "Status is required";
    if (!values.max_daily_appointments && values.max_daily_appointments !== 0 && values.max_daily_appointments !== false) nextErrors.max_daily_appointments = "Max Daily Appointments is required";
    if (!values.created_at && values.created_at !== 0 && values.created_at !== false) nextErrors.created_at = "Created At is required";
    if (!values.updated_at && values.updated_at !== 0 && values.updated_at !== false) nextErrors.updated_at = "Updated At is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = omitKey(values, 'clinician_id');
      if (isEdit) {
        await clinicianService.update(id as never, payload as never);
        toast.success('Clinician updated successfully');
        navigate(`/clinicians/${id}`);
      } else {
        const created = (await clinicianService.create(payload as never)) as Clinician;
        toast.success('Clinician created successfully');
        navigate(`/clinicians/${created.clinician_id}`);
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
        to={isEdit ? `/clinicians/${id}` : '/clinicians'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isEdit ? 'Edit Clinician' : 'New Clinician'}</h1>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEdit && (
          <>
        <TextField
          name="clinician_id"
          label={"Clinician Id"}
          value={String(values.clinician_id ?? '')}
          onChange={(v) => set('clinician_id', v)}
          required={false}
          error={errors.clinician_id}
          disabled={true}
        />
          </>
        )}
        <TextField
          name="first_name"
          label={"First Name"}
          value={String(values.first_name ?? '')}
          onChange={(v) => set('first_name', v)}
          required={true}
          error={errors.first_name}
          disabled={false}
        />
        <TextField
          name="last_name"
          label={"Last Name"}
          value={String(values.last_name ?? '')}
          onChange={(v) => set('last_name', v)}
          required={true}
          error={errors.last_name}
          disabled={false}
        />
        <TextField
          name="email"
          label={"Email"}
          value={String(values.email ?? '')}
          onChange={(v) => set('email', v)}
          required={true}
          error={errors.email}
          disabled={false}
        />
        <TextField
          name="npi_number"
          label={"Npi Number"}
          value={String(values.npi_number ?? '')}
          onChange={(v) => set('npi_number', v)}
          required={true}
          error={errors.npi_number}
          disabled={false}
        />
        <SelectField
          name="specialty"
          label={"Specialty"}
          value={String(values.specialty ?? '')}
          onChange={(v) => set('specialty', v)}
          options={['Primary Care', 'Cardiology', 'Orthopedics', 'Neurology', 'Pediatrics', 'OB-GYN', 'Psychiatry', 'Dermatology', 'Oncology', 'Other']}
          required={true}
          error={errors.specialty}
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
          name="status"
          label={"Status"}
          value={String(values.status ?? '')}
          onChange={(v) => set('status', v)}
          options={['Active', 'On Leave', 'Inactive']}
          required={true}
          error={errors.status}
          disabled={false}
        />
        <NumberField
          name="max_daily_appointments"
          label={"Max Daily Appointments"}
          value={typeof values.max_daily_appointments === 'number' ? values.max_daily_appointments : ''}
          onChange={(v) => set('max_daily_appointments', v)}
          required={true}
          error={errors.max_daily_appointments}
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
            {isEdit ? 'Save changes' : 'Create Clinician'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
