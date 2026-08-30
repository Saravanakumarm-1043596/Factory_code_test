import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import type { Provider } from '../types/Provider';
import { providerService } from '../services/ProviderService';
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
    npi: '',
    provider_name: '',
    provider_type: '',
    tax_id: '',
    clia_number: '',
    network_status: '',
    address: '',
    phone: '',
    email: '',
    is_active: false,
    created_at: '',
  };
}

function omitKey<T extends Record<string, unknown>>(obj: T, key: string): Record<string, unknown> {
  const { [key]: _omitted, ...rest } = obj;
  return rest;
}

export function ProviderFormPage() {
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
    providerService.list()
      .then((rows) => {
        const found = rows.find((r) => String(r.provider_id) === String(id));
        if (found) setValues({ ...found });
      })
      .catch(() => toast.error('Failed to load Provider'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function set(name: string, value: unknown) {
    setValues((s) => ({ ...s, [name]: value }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!values.npi && values.npi !== 0 && values.npi !== false) nextErrors.npi = "Npi is required";
    if (!values.provider_name && values.provider_name !== 0 && values.provider_name !== false) nextErrors.provider_name = "Provider Name is required";
    if (!values.provider_type && values.provider_type !== 0 && values.provider_type !== false) nextErrors.provider_type = "Provider Type is required";
    if (!values.tax_id && values.tax_id !== 0 && values.tax_id !== false) nextErrors.tax_id = "Tax Id is required";
    if (!values.network_status && values.network_status !== 0 && values.network_status !== false) nextErrors.network_status = "Network Status is required";
    if (!values.is_active && values.is_active !== 0 && values.is_active !== false) nextErrors.is_active = "Is Active is required";
    if (!values.created_at && values.created_at !== 0 && values.created_at !== false) nextErrors.created_at = "Created At is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = omitKey(values, 'provider_id');
      if (isEdit) {
        await providerService.update(id as never, payload as never);
        toast.success('Provider updated successfully');
        navigate(`/providers/${id}`);
      } else {
        const created = (await providerService.create(payload as never)) as Provider;
        toast.success('Provider created successfully');
        navigate(`/providers/${created.provider_id}`);
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
        to={isEdit ? `/providers/${id}` : '/providers'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isEdit ? 'Edit Provider' : 'New Provider'}</h1>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEdit && (
          <>
        <NumberField
          name="provider_id"
          label={"Provider Id"}
          value={typeof values.provider_id === 'number' ? values.provider_id : ''}
          onChange={(v) => set('provider_id', v)}
          required={false}
          error={errors.provider_id}
          disabled={true}
        />
          </>
        )}
        <TextField
          name="npi"
          label={"Npi"}
          value={String(values.npi ?? '')}
          onChange={(v) => set('npi', v)}
          required={true}
          error={errors.npi}
          disabled={false}
        />
        <TextField
          name="provider_name"
          label={"Provider Name"}
          value={String(values.provider_name ?? '')}
          onChange={(v) => set('provider_name', v)}
          required={true}
          error={errors.provider_name}
          disabled={false}
        />
        <SelectField
          name="provider_type"
          label={"Provider Type"}
          value={String(values.provider_type ?? '')}
          onChange={(v) => set('provider_type', v)}
          options={['Ordering Physician', 'Laboratory', 'Reference Lab', 'Hospital Lab']}
          required={true}
          error={errors.provider_type}
          disabled={false}
        />
        <TextField
          name="tax_id"
          label={"Tax Id"}
          value={String(values.tax_id ?? '')}
          onChange={(v) => set('tax_id', v)}
          required={true}
          error={errors.tax_id}
          disabled={false}
        />
        <TextField
          name="clia_number"
          label={"Clia Number"}
          value={String(values.clia_number ?? '')}
          onChange={(v) => set('clia_number', v)}
          required={false}
          error={errors.clia_number}
          disabled={false}
        />
        <SelectField
          name="network_status"
          label={"Network Status"}
          value={String(values.network_status ?? '')}
          onChange={(v) => set('network_status', v)}
          options={['In-Network', 'Out-of-Network', 'Pending']}
          required={true}
          error={errors.network_status}
          disabled={false}
        />
        <TextField
          name="address"
          label={"Address"}
          value={String(values.address ?? '')}
          onChange={(v) => set('address', v)}
          required={false}
          error={errors.address}
          disabled={false}
        />
        <TextField
          name="phone"
          label={"Phone"}
          value={String(values.phone ?? '')}
          onChange={(v) => set('phone', v)}
          required={false}
          error={errors.phone}
          disabled={false}
        />
        <TextField
          name="email"
          label={"Email"}
          value={String(values.email ?? '')}
          onChange={(v) => set('email', v)}
          required={false}
          error={errors.email}
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
            {isEdit ? 'Save changes' : 'Create Provider'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
