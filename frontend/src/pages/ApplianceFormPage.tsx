import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import type { Appliance } from '../types/Appliance';
import { applianceService } from '../services/ApplianceService';
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
    appliance_type: '',
    ip_address: '',
    hostname: '',
    environment: '',
    firmware_version: '',
    total_rule_count: '',
    last_synced_at: '',
    notes: '',
  };
}

function omitKey<T extends Record<string, unknown>>(obj: T, key: string): Record<string, unknown> {
  const { [key]: _omitted, ...rest } = obj;
  return rest;
}

export function ApplianceFormPage() {
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
    applianceService.list()
      .then((rows) => {
        const found = rows.find((r) => String(r.appliance_id) === String(id));
        if (found) setValues({ ...found });
      })
      .catch(() => toast.error('Failed to load Appliance'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function set(name: string, value: unknown) {
    setValues((s) => ({ ...s, [name]: value }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!values.name && values.name !== 0 && values.name !== false) nextErrors.name = "Name is required";
    if (!values.appliance_type && values.appliance_type !== 0 && values.appliance_type !== false) nextErrors.appliance_type = "Appliance Type is required";
    if (!values.ip_address && values.ip_address !== 0 && values.ip_address !== false) nextErrors.ip_address = "Ip Address is required";
    if (!values.environment && values.environment !== 0 && values.environment !== false) nextErrors.environment = "Environment is required";
    if (!values.total_rule_count && values.total_rule_count !== 0 && values.total_rule_count !== false) nextErrors.total_rule_count = "Total Rule Count is required";
    if (!values.last_synced_at && values.last_synced_at !== 0 && values.last_synced_at !== false) nextErrors.last_synced_at = "Last Synced At is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = omitKey(values, 'appliance_id');
      if (isEdit) {
        await applianceService.update(id as never, payload as never);
        toast.success('Appliance updated successfully');
        navigate(`/appliances/${id}`);
      } else {
        const created = (await applianceService.create(payload as never)) as Appliance;
        toast.success('Appliance created successfully');
        navigate(`/appliances/${created.appliance_id}`);
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
        to={isEdit ? `/appliances/${id}` : '/appliances'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isEdit ? 'Edit Appliance' : 'New Appliance'}</h1>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEdit && (
          <>
        <NumberField
          name="appliance_id"
          label={"Appliance Id"}
          value={typeof values.appliance_id === 'number' ? values.appliance_id : ''}
          onChange={(v) => set('appliance_id', v)}
          required={false}
          error={errors.appliance_id}
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
          name="appliance_type"
          label={"Appliance Type"}
          value={String(values.appliance_type ?? '')}
          onChange={(v) => set('appliance_type', v)}
          options={['Palo Alto', 'Fortinet', 'Azure Firewall', 'F5', 'Other']}
          required={true}
          error={errors.appliance_type}
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
          name="hostname"
          label={"Hostname"}
          value={String(values.hostname ?? '')}
          onChange={(v) => set('hostname', v)}
          required={false}
          error={errors.hostname}
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
        <TextField
          name="firmware_version"
          label={"Firmware Version"}
          value={String(values.firmware_version ?? '')}
          onChange={(v) => set('firmware_version', v)}
          required={false}
          error={errors.firmware_version}
          disabled={false}
        />
        <NumberField
          name="total_rule_count"
          label={"Total Rule Count"}
          value={typeof values.total_rule_count === 'number' ? values.total_rule_count : ''}
          onChange={(v) => set('total_rule_count', v)}
          required={true}
          error={errors.total_rule_count}
          disabled={false}
        />
        <DateField
          name="last_synced_at"
          label={"Last Synced At"}
          value={toDateInputValue(values.last_synced_at)}
          onChange={(v) => set('last_synced_at', v)}
          required={true}
          error={errors.last_synced_at}
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
            {isEdit ? 'Save changes' : 'Create Appliance'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
