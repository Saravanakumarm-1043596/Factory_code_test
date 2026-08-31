import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import type { PhiaccessLog } from '../types/PhiaccessLog';
import { phiaccessLogService } from '../services/PhiaccessLogService';
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
import { appUserService } from '../services/AppUserService';
import { patientService } from '../services/PatientService';

type FormState = Record<string, unknown>;

function emptyForm(): FormState {
  return {
    user_id: '',
    patient_id: '',
    resource_type: '',
    resource_id: '',
    action: '',
    access_reason: '',
    ip_address: '',
    user_agent: '',
    ehr_source_system: '',
    access_granted: false,
    denial_reason: '',
    accessed_at: '',
  };
}

function omitKey<T extends Record<string, unknown>>(obj: T, key: string): Record<string, unknown> {
  const { [key]: _omitted, ...rest } = obj;
  return rest;
}

export function PhiaccessLogFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [values, setValues] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [user_idOptions, setUser_idOptions] = useState<FKOption[]>([]);
  const [patient_idOptions, setPatient_idOptions] = useState<FKOption[]>([]);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    phiaccessLogService.list()
      .then((rows) => {
        const found = rows.find((r) => String(r.phi_access_log_id) === String(id));
        if (found) setValues({ ...found });
      })
      .catch(() => toast.error('Failed to load Phiaccess Log'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  useEffect(() => {
    appUserService.list()
      .then((rows) => setUser_idOptions(rows.map((r) => ({ value: String(r.app_user_id), label: `${r.first_name}` }))))
      .catch(() => setUser_idOptions([]));
  }, []);

  useEffect(() => {
    patientService.list()
      .then((rows) => setPatient_idOptions(rows.map((r) => ({ value: String(r.patient_id), label: `${r.first_name}` }))))
      .catch(() => setPatient_idOptions([]));
  }, []);

  function set(name: string, value: unknown) {
    setValues((s) => ({ ...s, [name]: value }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!values.user_id && values.user_id !== 0 && values.user_id !== false) nextErrors.user_id = "User Id is required";
    if (!values.patient_id && values.patient_id !== 0 && values.patient_id !== false) nextErrors.patient_id = "Patient Id is required";
    if (!values.resource_type && values.resource_type !== 0 && values.resource_type !== false) nextErrors.resource_type = "Resource Type is required";
    if (!values.resource_id && values.resource_id !== 0 && values.resource_id !== false) nextErrors.resource_id = "Resource Id is required";
    if (!values.action && values.action !== 0 && values.action !== false) nextErrors.action = "Action is required";
    if (!values.access_reason && values.access_reason !== 0 && values.access_reason !== false) nextErrors.access_reason = "Access Reason is required";
    if (!values.ip_address && values.ip_address !== 0 && values.ip_address !== false) nextErrors.ip_address = "Ip Address is required";
    if (!values.access_granted && values.access_granted !== 0 && values.access_granted !== false) nextErrors.access_granted = "Access Granted is required";
    if (!values.accessed_at && values.accessed_at !== 0 && values.accessed_at !== false) nextErrors.accessed_at = "Accessed At is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = omitKey(values, 'phi_access_log_id');
      if (isEdit) {
        await phiaccessLogService.update(id as never, payload as never);
        toast.success('Phiaccess Log updated successfully');
        navigate(`/phiaccess-logs/${id}`);
      } else {
        const created = (await phiaccessLogService.create(payload as never)) as PhiaccessLog;
        toast.success('Phiaccess Log created successfully');
        navigate(`/phiaccess-logs/${created.phi_access_log_id}`);
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
        to={isEdit ? `/phiaccess-logs/${id}` : '/phiaccess-logs'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isEdit ? 'Edit Phiaccess Log' : 'New Phiaccess Log'}</h1>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEdit && (
          <>
        <TextField
          name="phi_access_log_id"
          label={"Phi Access Log Id"}
          value={String(values.phi_access_log_id ?? '')}
          onChange={(v) => set('phi_access_log_id', v)}
          required={false}
          error={errors.phi_access_log_id}
          disabled={true}
        />
          </>
        )}
        <FKSelectField
          name="user_id"
          label={"User Id"}
          value={String(values.user_id ?? '')}
          onChange={(v) => set('user_id', v)}
          options={user_idOptions}
          required={true}
          error={errors.user_id}
          disabled={false}
        />
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
        <SelectField
          name="resource_type"
          label={"Resource Type"}
          value={String(values.resource_type ?? '')}
          onChange={(v) => set('resource_type', v)}
          options={['Patient Record', 'Appointment', 'Engagement Record', 'Audit Report', 'Consent Document', 'Breach Record']}
          required={true}
          error={errors.resource_type}
          disabled={false}
        />
        <TextField
          name="resource_id"
          label={"Resource Id"}
          value={String(values.resource_id ?? '')}
          onChange={(v) => set('resource_id', v)}
          required={true}
          error={errors.resource_id}
          disabled={false}
        />
        <SelectField
          name="action"
          label={"Action"}
          value={String(values.action ?? '')}
          onChange={(v) => set('action', v)}
          options={['View', 'Create', 'Update', 'Delete', 'Export', 'Print']}
          required={true}
          error={errors.action}
          disabled={false}
        />
        <SelectField
          name="access_reason"
          label={"Access Reason"}
          value={String(values.access_reason ?? '')}
          onChange={(v) => set('access_reason', v)}
          options={['Treatment', 'Payment', 'Operations', 'Patient Request', 'Audit', 'Emergency']}
          required={true}
          error={errors.access_reason}
          disabled={false}
        />
        <TextField
          name="ip_address"
          label={"Ip Address"}
          value={String(values.ip_address ?? '')}
          onChange={(v) => set('ip_address', v)}
          required={true}
          error={errors.ip_address}
          disabled={false}
        />
        <TextField
          name="user_agent"
          label={"User Agent"}
          value={String(values.user_agent ?? '')}
          onChange={(v) => set('user_agent', v)}
          required={false}
          error={errors.user_agent}
          disabled={false}
        />
        <SelectField
          name="ehr_source_system"
          label={"Ehr Source System"}
          value={String(values.ehr_source_system ?? '')}
          onChange={(v) => set('ehr_source_system', v)}
          options={['Epic', 'Cerner', 'Internal']}
          required={false}
          error={errors.ehr_source_system}
          disabled={false}
        />
        <CheckboxField
          name="access_granted"
          label={"Access Granted"}
          value={Boolean(values.access_granted)}
          onChange={(v) => set('access_granted', v)}
          disabled={false}
        />
        <SelectField
          name="denial_reason"
          label={"Denial Reason"}
          value={String(values.denial_reason ?? '')}
          onChange={(v) => set('denial_reason', v)}
          options={['Insufficient Role', 'Break-the-Glass Required', 'Consent Not on File', 'Account Locked']}
          required={false}
          error={errors.denial_reason}
          disabled={false}
        />
        <DateField
          name="accessed_at"
          label={"Accessed At"}
          value={toDateInputValue(values.accessed_at)}
          onChange={(v) => set('accessed_at', v)}
          required={true}
          error={errors.accessed_at}
          disabled={false}
        />
        </div>
        <div className="mt-6 flex gap-3">
          <Button onClick={handleSubmit} loading={submitting}>
            {isEdit ? 'Save changes' : 'Create Phiaccess Log'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
