import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import type { LineOfBusiness } from '../types/LineOfBusiness';
import { lineOfBusinessService } from '../services/LineOfBusinessService';
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
    description: '',
    regulatory_framework: '',
    is_active: false,
    created_at: '',
  };
}

function omitKey<T extends Record<string, unknown>>(obj: T, key: string): Record<string, unknown> {
  const { [key]: _omitted, ...rest } = obj;
  return rest;
}

export function LineOfBusinessFormPage() {
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
    lineOfBusinessService.list()
      .then((rows) => {
        const found = rows.find((r) => String(r.line_of_business_id) === String(id));
        if (found) setValues({ ...found });
      })
      .catch(() => toast.error('Failed to load Line Of Business'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function set(name: string, value: unknown) {
    setValues((s) => ({ ...s, [name]: value }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!values.name && values.name !== 0 && values.name !== false) nextErrors.name = "Name is required";
    if (!values.regulatory_framework && values.regulatory_framework !== 0 && values.regulatory_framework !== false) nextErrors.regulatory_framework = "Regulatory Framework is required";
    if (!values.is_active && values.is_active !== 0 && values.is_active !== false) nextErrors.is_active = "Is Active is required";
    if (!values.created_at && values.created_at !== 0 && values.created_at !== false) nextErrors.created_at = "Created At is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = omitKey(values, 'line_of_business_id');
      if (isEdit) {
        await lineOfBusinessService.update(id as never, payload as never);
        toast.success('Line Of Business updated successfully');
        navigate(`/line-of-businesses/${id}`);
      } else {
        const created = (await lineOfBusinessService.create(payload as never)) as LineOfBusiness;
        toast.success('Line Of Business created successfully');
        navigate(`/line-of-businesses/${created.line_of_business_id}`);
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
        to={isEdit ? `/line-of-businesses/${id}` : '/line-of-businesses'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isEdit ? 'Edit Line Of Business' : 'New Line Of Business'}</h1>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEdit && (
          <>
        <NumberField
          name="line_of_business_id"
          label={"Line Of Business Id"}
          value={typeof values.line_of_business_id === 'number' ? values.line_of_business_id : ''}
          onChange={(v) => set('line_of_business_id', v)}
          required={false}
          error={errors.line_of_business_id}
          disabled={true}
        />
          </>
        )}
        <SelectField
          name="name"
          label={"Name"}
          value={String(values.name ?? '')}
          onChange={(v) => set('name', v)}
          options={['Commercial', 'Medicare Advantage']}
          required={true}
          error={errors.name}
          disabled={false}
        />
        <TextAreaField
          name="description"
          label={"Description"}
          value={String(values.description ?? '')}
          onChange={(v) => set('description', v)}
          required={false}
          error={errors.description}
          disabled={false}
        />
        <SelectField
          name="regulatory_framework"
          label={"Regulatory Framework"}
          value={String(values.regulatory_framework ?? '')}
          onChange={(v) => set('regulatory_framework', v)}
          options={['State DOI', 'CMS Federal']}
          required={true}
          error={errors.regulatory_framework}
          disabled={false}
        />
        <CheckboxField
          name="is_active"
          label={"Is Active"}
          value={Boolean(values.is_active)}
          onChange={(v) => set('is_active', v)}
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
            {isEdit ? 'Save changes' : 'Create Line Of Business'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
