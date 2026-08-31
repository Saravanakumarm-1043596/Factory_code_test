import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import type { NetworkSecurityGroup } from '../types/NetworkSecurityGroup';
import { networkSecurityGroupService } from '../services/NetworkSecurityGroupService';
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
    azure_resource_id: '',
    subscription: '',
    resource_group: '',
    region: '',
    associated_subnet: '',
    associated_nic: '',
    total_rule_count: '',
    last_synced_at: '',
    notes: '',
  };
}

function omitKey<T extends Record<string, unknown>>(obj: T, key: string): Record<string, unknown> {
  const { [key]: _omitted, ...rest } = obj;
  return rest;
}

export function NetworkSecurityGroupFormPage() {
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
    networkSecurityGroupService.list()
      .then((rows) => {
        const found = rows.find((r) => String(r.network_security_group_id) === String(id));
        if (found) setValues({ ...found });
      })
      .catch(() => toast.error('Failed to load Network Security Group'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function set(name: string, value: unknown) {
    setValues((s) => ({ ...s, [name]: value }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!values.name && values.name !== 0 && values.name !== false) nextErrors.name = "Name is required";
    if (!values.azure_resource_id && values.azure_resource_id !== 0 && values.azure_resource_id !== false) nextErrors.azure_resource_id = "Azure Resource Id is required";
    if (!values.subscription && values.subscription !== 0 && values.subscription !== false) nextErrors.subscription = "Subscription is required";
    if (!values.resource_group && values.resource_group !== 0 && values.resource_group !== false) nextErrors.resource_group = "Resource Group is required";
    if (!values.region && values.region !== 0 && values.region !== false) nextErrors.region = "Region is required";
    if (!values.total_rule_count && values.total_rule_count !== 0 && values.total_rule_count !== false) nextErrors.total_rule_count = "Total Rule Count is required";
    if (!values.last_synced_at && values.last_synced_at !== 0 && values.last_synced_at !== false) nextErrors.last_synced_at = "Last Synced At is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = omitKey(values, 'network_security_group_id');
      if (isEdit) {
        await networkSecurityGroupService.update(id as never, payload as never);
        toast.success('Network Security Group updated successfully');
        navigate(`/network-security-groups/${id}`);
      } else {
        const created = (await networkSecurityGroupService.create(payload as never)) as NetworkSecurityGroup;
        toast.success('Network Security Group created successfully');
        navigate(`/network-security-groups/${created.network_security_group_id}`);
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
        to={isEdit ? `/network-security-groups/${id}` : '/network-security-groups'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isEdit ? 'Edit Network Security Group' : 'New Network Security Group'}</h1>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEdit && (
          <>
        <NumberField
          name="network_security_group_id"
          label={"Network Security Group Id"}
          value={typeof values.network_security_group_id === 'number' ? values.network_security_group_id : ''}
          onChange={(v) => set('network_security_group_id', v)}
          required={false}
          error={errors.network_security_group_id}
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
          name="azure_resource_id"
          label={"Azure Resource Id"}
          value={String(values.azure_resource_id ?? '')}
          onChange={(v) => set('azure_resource_id', v)}
          required={true}
          error={errors.azure_resource_id}
          disabled={false}
        />
        <TextField
          name="subscription"
          label={"Subscription"}
          value={String(values.subscription ?? '')}
          onChange={(v) => set('subscription', v)}
          required={true}
          error={errors.subscription}
          disabled={false}
        />
        <TextField
          name="resource_group"
          label={"Resource Group"}
          value={String(values.resource_group ?? '')}
          onChange={(v) => set('resource_group', v)}
          required={true}
          error={errors.resource_group}
          disabled={false}
        />
        <TextField
          name="region"
          label={"Region"}
          value={String(values.region ?? '')}
          onChange={(v) => set('region', v)}
          required={true}
          error={errors.region}
          disabled={false}
        />
        <TextField
          name="associated_subnet"
          label={"Associated Subnet"}
          value={String(values.associated_subnet ?? '')}
          onChange={(v) => set('associated_subnet', v)}
          required={false}
          error={errors.associated_subnet}
          disabled={false}
        />
        <TextField
          name="associated_nic"
          label={"Associated Nic"}
          value={String(values.associated_nic ?? '')}
          onChange={(v) => set('associated_nic', v)}
          required={false}
          error={errors.associated_nic}
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
            {isEdit ? 'Save changes' : 'Create Network Security Group'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
