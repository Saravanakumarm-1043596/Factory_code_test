import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import type { PhiAccessLog } from '../types/PhiAccessLog';
import { phiAccessLogService } from '../services/PhiAccessLogService';
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
import { userService } from '../services/UserService';

type FormState = Record<string, unknown>;

function emptyForm(): FormState {
  return {
    user_id: '',
    entity_type: '',
    entity_record_id: '',
    access_type: '',
    source_system: '',
    access_reason: '',
    ip_address: '',
    access_timestamp: '',
    phi_fields_accessed: '',
    was_authorized: false,
    notes: '',
  };
}

function omitKey<T extends Record<string, unknown>>(obj: T, key: string): Record<string, unknown> {
  const { [key]: _omitted, ...rest } = obj;
  return rest;
}

export function PhiAccessLogFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [values, setValues] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [user_idOptions, setUser_idOptions] = useState<FKOption[]>([]);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    phiAccessLogService.list()
      .then((rows) => {
        const found = rows.find((r) => String(r.phi_access_log_id) === String(id));
        if (found) setValues({ ...found });
      })
      .catch(() => toast.error('Failed to load Phi Access Log'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  useEffect(() => {
    userService.list()
      .then((rows) => setUser_idOptions(rows.map((r) => ({ value: String(r.user_id), label: `${r.first_name}` }))))
      .catch(() => setUser_idOptions([]));
  }, []);

  function set(name: string, value: unknown) {
    setValues((s) => ({ ...s, [name]: value }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!values.user_id && values.user_id !== 0 && values.user_id !== false) nextErrors.user_id = "User Id is required";
    if (!values.entity_type && values.entity_type !== 0 && values.entity_type !== false) nextErrors.entity_type = "Entity Type is required";
    if (!values.entity_record_id && values.entity_record_id !== 0 && values.entity_record_id !== false) nextErrors.entity_record_id = "Entity Record Id is required";
    if (!values.access_type && values.access_type !== 0 && values.access_type !== false) nextErrors.access_type = "Access Type is required";
    if (!values.source_system && values.source_system !== 0 && values.source_system !== false) nextErrors.source_system = "Source System is required";
    if (!values.access_reason && values.access_reason !== 0 && values.access_reason !== false) nextErrors.access_reason = "Access Reason is required";
    if (!values.access_timestamp && values.access_timestamp !== 0 && values.access_timestamp !== false) nextErrors.access_timestamp = "Access Timestamp is required";
    if (!values.was_authorized && values.was_authorized !== 0 && values.was_authorized !== false) nextErrors.was_authorized = "Was Authorized is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = omitKey(values, 'phi_access_log_id');
      if (isEdit) {
        await phiAccessLogService.update(id as never, payload as never);
        toast.success('Phi Access Log updated successfully');
        navigate(`/phi-access-logs/${id}`);
      } else {
        const created = (await phiAccessLogService.create(payload as never)) as PhiAccessLog;
        toast.success('Phi Access Log created successfully');
        navigate(`/phi-access-logs/${created.phi_access_log_id}`);
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
        to={isEdit ? `/phi-access-logs/${id}` : '/phi-access-logs'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isEdit ? 'Edit Phi Access Log' : 'New Phi Access Log'}</h1>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEdit && (
          <>
        <NumberField
          name="phi_access_log_id"
          label={"Phi Access Log Id"}
          value={typeof values.phi_access_log_id === 'number' ? values.phi_access_log_id : ''}
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
          onChange={(v) => set('user_id', v === '' ? '' : Number(v))}
          options={user_idOptions}
          required={true}
          error={errors.user_id}
          disabled={false}
        />
        <SelectField
          name="entity_type"
          label={"Entity Type"}
          value={String(values.entity_type ?? '')}
          onChange={(v) => set('entity_type', v)}
          options={['Member', 'LabTestOrder', 'LabTestLine', 'Claim']}
          required={true}
          error={errors.entity_type}
          disabled={false}
        />
        <NumberField
          name="entity_record_id"
          label={"Entity Record Id"}
          value={typeof values.entity_record_id === 'number' ? values.entity_record_id : ''}
          onChange={(v) => set('entity_record_id', v)}
          required={true}
          error={errors.entity_record_id}
          disabled={false}
        />
        <SelectField
          name="access_type"
          label={"Access Type"}
          value={String(values.access_type ?? '')}
          onChange={(v) => set('access_type', v)}
          options={['View', 'Create', 'Update', 'Delete', 'Export', 'Print']}
          required={true}
          error={errors.access_type}
          disabled={false}
        />
        <SelectField
          name="source_system"
          label={"Source System"}
          value={String(values.source_system ?? '')}
          onChange={(v) => set('source_system', v)}
          options={['Facets', 'Epic', 'This Application']}
          required={true}
          error={errors.source_system}
          disabled={false}
        />
        <SelectField
          name="access_reason"
          label={"Access Reason"}
          value={String(values.access_reason ?? '')}
          onChange={(v) => set('access_reason', v)}
          options={['Treatment', 'Payment', 'Operations', 'Audit', 'Member Request', 'Legal']}
          required={true}
          error={errors.access_reason}
          disabled={false}
        />
        <TextField
          name="ip_address"
          label={"Ip Address"}
          value={String(values.ip_address ?? '')}
          onChange={(v) => set('ip_address', v)}
          required={false}
          error={errors.ip_address}
          disabled={false}
        />
        <DateField
          name="access_timestamp"
          label={"Access Timestamp"}
          value={toDateInputValue(values.access_timestamp)}
          onChange={(v) => set('access_timestamp', v)}
          required={true}
          error={errors.access_timestamp}
          disabled={false}
        />
        <TextField
          name="phi_fields_accessed"
          label={"Phi Fields Accessed"}
          value={String(values.phi_fields_accessed ?? '')}
          onChange={(v) => set('phi_fields_accessed', v)}
          required={false}
          error={errors.phi_fields_accessed}
          disabled={false}
        />
        <CheckboxField
          name="was_authorized"
          label={"Was Authorized"}
          value={Boolean(values.was_authorized)}
          onChange={(v) => set('was_authorized', v)}
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
        </div>
        <div className="mt-6 flex gap-3">
          <Button onClick={handleSubmit} loading={submitting}>
            {isEdit ? 'Save changes' : 'Create Phi Access Log'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
