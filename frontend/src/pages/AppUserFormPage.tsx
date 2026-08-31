import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import type { AppUser } from '../types/AppUser';
import { appUserService } from '../services/AppUserService';
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

type FormState = Record<string, unknown>;

function emptyForm(): FormState {
  return {
    email: '',
    first_name: '',
    last_name: '',
    role: '',
    clinician_id: '',
    facility_id: '',
    status: '',
    mfa_enabled: false,
    last_login_at: '',
    password_changed_at: '',
    created_at: '',
    updated_at: '',
  };
}

function omitKey<T extends Record<string, unknown>>(obj: T, key: string): Record<string, unknown> {
  const { [key]: _omitted, ...rest } = obj;
  return rest;
}

export function AppUserFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [values, setValues] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [clinician_idOptions, setClinician_idOptions] = useState<FKOption[]>([]);
  const [facility_idOptions, setFacility_idOptions] = useState<FKOption[]>([]);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    appUserService.list()
      .then((rows) => {
        const found = rows.find((r) => String(r.app_user_id) === String(id));
        if (found) setValues({ ...found });
      })
      .catch(() => toast.error('Failed to load App User'))
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

  function set(name: string, value: unknown) {
    setValues((s) => ({ ...s, [name]: value }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!values.email && values.email !== 0 && values.email !== false) nextErrors.email = "Email is required";
    if (!values.first_name && values.first_name !== 0 && values.first_name !== false) nextErrors.first_name = "First Name is required";
    if (!values.last_name && values.last_name !== 0 && values.last_name !== false) nextErrors.last_name = "Last Name is required";
    if (!values.role && values.role !== 0 && values.role !== false) nextErrors.role = "Role is required";
    if (!values.status && values.status !== 0 && values.status !== false) nextErrors.status = "Status is required";
    if (!values.mfa_enabled && values.mfa_enabled !== 0 && values.mfa_enabled !== false) nextErrors.mfa_enabled = "Mfa Enabled is required";
    if (!values.created_at && values.created_at !== 0 && values.created_at !== false) nextErrors.created_at = "Created At is required";
    if (!values.updated_at && values.updated_at !== 0 && values.updated_at !== false) nextErrors.updated_at = "Updated At is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = omitKey(values, 'app_user_id');
      if (isEdit) {
        await appUserService.update(id as never, payload as never);
        toast.success('App User updated successfully');
        navigate(`/app-users/${id}`);
      } else {
        const created = (await appUserService.create(payload as never)) as AppUser;
        toast.success('App User created successfully');
        navigate(`/app-users/${created.app_user_id}`);
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
        to={isEdit ? `/app-users/${id}` : '/app-users'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isEdit ? 'Edit App User' : 'New App User'}</h1>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEdit && (
          <>
        <TextField
          name="app_user_id"
          label={"App User Id"}
          value={String(values.app_user_id ?? '')}
          onChange={(v) => set('app_user_id', v)}
          required={false}
          error={errors.app_user_id}
          disabled={true}
        />
          </>
        )}
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
        <SelectField
          name="role"
          label={"Role"}
          value={String(values.role ?? '')}
          onChange={(v) => set('role', v)}
          options={['System Admin', 'Privacy Officer', 'Scheduling Manager', 'Clinician', 'Front Desk', 'Data Analyst', 'Read-Only Auditor']}
          required={true}
          error={errors.role}
          disabled={false}
        />
        <FKSelectField
          name="clinician_id"
          label={"Clinician Id"}
          value={String(values.clinician_id ?? '')}
          onChange={(v) => set('clinician_id', v)}
          options={clinician_idOptions}
          required={false}
          error={errors.clinician_id}
          disabled={false}
        />
        <FKSelectField
          name="facility_id"
          label={"Facility Id"}
          value={String(values.facility_id ?? '')}
          onChange={(v) => set('facility_id', v)}
          options={facility_idOptions}
          required={false}
          error={errors.facility_id}
          disabled={false}
        />
        <SelectField
          name="status"
          label={"Status"}
          value={String(values.status ?? '')}
          onChange={(v) => set('status', v)}
          options={['Active', 'Locked', 'Deactivated']}
          required={true}
          error={errors.status}
          disabled={false}
        />
        <CheckboxField
          name="mfa_enabled"
          label={"Mfa Enabled"}
          value={Boolean(values.mfa_enabled)}
          onChange={(v) => set('mfa_enabled', v)}
          disabled={false}
        />
        <DateField
          name="last_login_at"
          label={"Last Login At"}
          value={toDateInputValue(values.last_login_at)}
          onChange={(v) => set('last_login_at', v)}
          required={false}
          error={errors.last_login_at}
          disabled={false}
        />
        <DateField
          name="password_changed_at"
          label={"Password Changed At"}
          value={toDateInputValue(values.password_changed_at)}
          onChange={(v) => set('password_changed_at', v)}
          required={false}
          error={errors.password_changed_at}
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
            {isEdit ? 'Save changes' : 'Create App User'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
