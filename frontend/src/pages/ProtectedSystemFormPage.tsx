import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import type { ProtectedSystem } from '../types/ProtectedSystem';
import { protectedSystemService } from '../services/ProtectedSystemService';
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
    system_type: '',
    environment: '',
    contains_phi: false,
    data_classification: '',
    owner: '',
    ip_range: '',
    compliance_scope: '',
    last_assessment_date: '',
    notes: '',
  };
}

function omitKey<T extends Record<string, unknown>>(obj: T, key: string): Record<string, unknown> {
  const { [key]: _omitted, ...rest } = obj;
  return rest;
}

export function ProtectedSystemFormPage() {
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
    protectedSystemService.list()
      .then((rows) => {
        const found = rows.find((r) => String(r.protected_system_id) === String(id));
        if (found) setValues({ ...found });
      })
      .catch(() => toast.error('Failed to load Protected System'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function set(name: string, value: unknown) {
    setValues((s) => ({ ...s, [name]: value }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!values.name && values.name !== 0 && values.name !== false) nextErrors.name = "Name is required";
    if (!values.system_type && values.system_type !== 0 && values.system_type !== false) nextErrors.system_type = "System Type is required";
    if (!values.environment && values.environment !== 0 && values.environment !== false) nextErrors.environment = "Environment is required";
    if (!values.contains_phi && values.contains_phi !== 0 && values.contains_phi !== false) nextErrors.contains_phi = "Contains Phi is required";
    if (!values.data_classification && values.data_classification !== 0 && values.data_classification !== false) nextErrors.data_classification = "Data Classification is required";
    if (!values.owner && values.owner !== 0 && values.owner !== false) nextErrors.owner = "Owner is required";
    if (!values.compliance_scope && values.compliance_scope !== 0 && values.compliance_scope !== false) nextErrors.compliance_scope = "Compliance Scope is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = omitKey(values, 'protected_system_id');
      if (isEdit) {
        await protectedSystemService.update(id as never, payload as never);
        toast.success('Protected System updated successfully');
        navigate(`/protected-systems/${id}`);
      } else {
        const created = (await protectedSystemService.create(payload as never)) as ProtectedSystem;
        toast.success('Protected System created successfully');
        navigate(`/protected-systems/${created.protected_system_id}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white shadow-sm p-4" />;
  }

  return (
    <div>
      <Link
        to={isEdit ? `/protected-systems/${id}` : '/protected-systems'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isEdit ? 'Edit Protected System' : 'New Protected System'}</h1>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEdit && (
          <>
        <NumberField
          name="protected_system_id"
          label={"Protected System Id"}
          value={typeof values.protected_system_id === 'number' ? values.protected_system_id : ''}
          onChange={(v) => set('protected_system_id', v)}
          required={false}
          error={errors.protected_system_id}
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
        <SelectField
          name="system_type"
          label={"System Type"}
          value={String(values.system_type ?? '')}
          onChange={(v) => set('system_type', v)}
          options={['Facets', 'Epic', 'Data Warehouse', 'Integration Engine', 'Portal', 'Other']}
          required={true}
          error={errors.system_type}
          disabled={false}
        />
        <SelectField
          name="environment"
          label={"Environment"}
          value={String(values.environment ?? '')}
          onChange={(v) => set('environment', v)}
          options={['Production', 'Staging', 'Development', 'DR']}
          required={true}
          error={errors.environment}
          disabled={false}
        />
        <CheckboxField
          name="contains_phi"
          label={"Contains Phi"}
          value={Boolean(values.contains_phi)}
          onChange={(v) => set('contains_phi', v)}
          disabled={false}
        />
        <SelectField
          name="data_classification"
          label={"Data Classification"}
          value={String(values.data_classification ?? '')}
          onChange={(v) => set('data_classification', v)}
          options={['Restricted', 'Confidential', 'Internal', 'Public']}
          required={true}
          error={errors.data_classification}
          disabled={false}
        />
        <TextField
          name="owner"
          label={"Owner"}
          value={String(values.owner ?? '')}
          onChange={(v) => set('owner', v)}
          required={true}
          error={errors.owner}
          disabled={false}
        />
        <TextField
          name="ip_range"
          label={"Ip Range"}
          value={String(values.ip_range ?? '')}
          onChange={(v) => set('ip_range', v)}
          required={false}
          error={errors.ip_range}
          disabled={false}
        />
        <SelectField
          name="compliance_scope"
          label={"Compliance Scope"}
          value={String(values.compliance_scope ?? '')}
          onChange={(v) => set('compliance_scope', v)}
          options={['HIPAA', 'HITRUST', 'SOC2', 'Multiple']}
          required={true}
          error={errors.compliance_scope}
          disabled={false}
        />
        <DateField
          name="last_assessment_date"
          label={"Last Assessment Date"}
          value={toDateInputValue(values.last_assessment_date)}
          onChange={(v) => set('last_assessment_date', v)}
          required={false}
          error={errors.last_assessment_date}
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
            {isEdit ? 'Save changes' : 'Create Protected System'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
