import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import type { Facility } from '../types/Facility';
import { facilityService } from '../services/FacilityService';
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
} from '../components/ui/FormFields';

type FormState = Record<string, unknown>;

function emptyForm(): FormState {
  return {
    name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    phone_number: '',
    ehr_source_system: '',
    facility_type: '',
    status: '',
    created_at: '',
  };
}

function omitKey<T extends Record<string, unknown>>(obj: T, key: string): Record<string, unknown> {
  const { [key]: _omitted, ...rest } = obj;
  return rest;
}

export function FacilityFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [values, setValues] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    facilityService.list()
      .then((rows) => {
        const found = rows.find((r) => String(r.facility_id) === String(id));
        if (found) setValues({ ...found });
      })
      .catch(() => toast.error('Failed to load Facility'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function set(name: string, value: unknown) {
    setValues((s) => ({ ...s, [name]: value }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!values.name && values.name !== 0 && values.name !== false) nextErrors.name = "Name is required";
    if (!values.address && values.address !== 0 && values.address !== false) nextErrors.address = "Address is required";
    if (!values.city && values.city !== 0 && values.city !== false) nextErrors.city = "City is required";
    if (!values.state && values.state !== 0 && values.state !== false) nextErrors.state = "State is required";
    if (!values.zip_code && values.zip_code !== 0 && values.zip_code !== false) nextErrors.zip_code = "Zip Code is required";
    if (!values.phone_number && values.phone_number !== 0 && values.phone_number !== false) nextErrors.phone_number = "Phone Number is required";
    if (!values.ehr_source_system && values.ehr_source_system !== 0 && values.ehr_source_system !== false) nextErrors.ehr_source_system = "Ehr Source System is required";
    if (!values.facility_type && values.facility_type !== 0 && values.facility_type !== false) nextErrors.facility_type = "Facility Type is required";
    if (!values.status && values.status !== 0 && values.status !== false) nextErrors.status = "Status is required";
    if (!values.created_at && values.created_at !== 0 && values.created_at !== false) nextErrors.created_at = "Created At is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = omitKey(values, 'facility_id');
      if (isEdit) {
        await facilityService.update(id as never, payload as never);
        toast.success('Facility updated successfully');
        navigate(`/facilities/${id}`);
      } else {
        const created = (await facilityService.create(payload as never)) as Facility;
        toast.success('Facility created successfully');
        navigate(`/facilities/${created.facility_id}`);
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
        to={isEdit ? `/facilities/${id}` : '/facilities'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isEdit ? 'Edit Facility' : 'New Facility'}</h1>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEdit && (
          <>
        <TextField
          name="facility_id"
          label={"Facility Id"}
          value={String(values.facility_id ?? '')}
          onChange={(v) => set('facility_id', v)}
          required={false}
          error={errors.facility_id}
          disabled={true}
        />
          </>
        )}
        <TextField
          name="name"
          label={"Name"}
          value={String(values.name ?? '')}
          onChange={(v) => set('name', v)}
          required={true}
          error={errors.name}
          disabled={false}
        />
        <TextField
          name="address"
          label={"Address"}
          value={String(values.address ?? '')}
          onChange={(v) => set('address', v)}
          required={true}
          error={errors.address}
          disabled={false}
        />
        <TextField
          name="city"
          label={"City"}
          value={String(values.city ?? '')}
          onChange={(v) => set('city', v)}
          required={true}
          error={errors.city}
          disabled={false}
        />
        <SelectField
          name="state"
          label={"State"}
          value={String(values.state ?? '')}
          onChange={(v) => set('state', v)}
          options={[]}
          required={true}
          error={errors.state}
          disabled={false}
        />
        <TextField
          name="zip_code"
          label={"Zip Code"}
          value={String(values.zip_code ?? '')}
          onChange={(v) => set('zip_code', v)}
          required={true}
          error={errors.zip_code}
          disabled={false}
        />
        <TextField
          name="phone_number"
          label={"Phone Number"}
          value={String(values.phone_number ?? '')}
          onChange={(v) => set('phone_number', v)}
          required={true}
          error={errors.phone_number}
          disabled={false}
        />
        <SelectField
          name="ehr_source_system"
          label={"Ehr Source System"}
          value={String(values.ehr_source_system ?? '')}
          onChange={(v) => set('ehr_source_system', v)}
          options={['Epic', 'Cerner', 'Both']}
          required={true}
          error={errors.ehr_source_system}
          disabled={false}
        />
        <SelectField
          name="facility_type"
          label={"Facility Type"}
          value={String(values.facility_type ?? '')}
          onChange={(v) => set('facility_type', v)}
          options={['Hospital', 'Outpatient Clinic', 'Urgent Care', 'Telehealth Hub', 'Specialty Center']}
          required={true}
          error={errors.facility_type}
          disabled={false}
        />
        <SelectField
          name="status"
          label={"Status"}
          value={String(values.status ?? '')}
          onChange={(v) => set('status', v)}
          options={['Open', 'Closed', 'Under Renovation']}
          required={true}
          error={errors.status}
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
            {isEdit ? 'Save changes' : 'Create Facility'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
