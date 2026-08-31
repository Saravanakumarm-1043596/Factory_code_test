import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import type { FirewallRuleSet } from '../types/FirewallRuleSet';
import { firewallRuleSetService } from '../services/FirewallRuleSetService';
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
import { networkSecurityGroupService } from '../services/NetworkSecurityGroupService';
import { applianceService } from '../services/ApplianceService';
import { protectedSystemService } from '../services/ProtectedSystemService';

type FormState = Record<string, unknown>;

function emptyForm(): FormState {
  return {
    name: '',
    description: '',
    network_security_group_id: '',
    appliance_id: '',
    protected_system_id: '',
    rule_count: '',
    status: '',
    last_reviewed_at: '',
    created_at: '',
    updated_at: '',
  };
}

function omitKey<T extends Record<string, unknown>>(obj: T, key: string): Record<string, unknown> {
  const { [key]: _omitted, ...rest } = obj;
  return rest;
}

export function FirewallRuleSetFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [values, setValues] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [network_security_group_idOptions, setNetwork_security_group_idOptions] = useState<FKOption[]>([]);
  const [appliance_idOptions, setAppliance_idOptions] = useState<FKOption[]>([]);
  const [protected_system_idOptions, setProtected_system_idOptions] = useState<FKOption[]>([]);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    firewallRuleSetService.list()
      .then((rows) => {
        const found = rows.find((r) => String(r.firewall_rule_set_id) === String(id));
        if (found) setValues({ ...found });
      })
      .catch(() => toast.error('Failed to load Firewall Rule Set'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  useEffect(() => {
    networkSecurityGroupService.list()
      .then((rows) => setNetwork_security_group_idOptions(rows.map((r) => ({ value: String(r.network_security_group_id), label: `${r.name}` }))))
      .catch(() => setNetwork_security_group_idOptions([]));
  }, []);

  useEffect(() => {
    applianceService.list()
      .then((rows) => setAppliance_idOptions(rows.map((r) => ({ value: String(r.appliance_id), label: `${r.name}` }))))
      .catch(() => setAppliance_idOptions([]));
  }, []);

  useEffect(() => {
    protectedSystemService.list()
      .then((rows) => setProtected_system_idOptions(rows.map((r) => ({ value: String(r.protected_system_id), label: `${r.name}` }))))
      .catch(() => setProtected_system_idOptions([]));
  }, []);

  function set(name: string, value: unknown) {
    setValues((s) => ({ ...s, [name]: value }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!values.name && values.name !== 0 && values.name !== false) nextErrors.name = "Name is required";
    if (!values.rule_count && values.rule_count !== 0 && values.rule_count !== false) nextErrors.rule_count = "Rule Count is required";
    if (!values.status && values.status !== 0 && values.status !== false) nextErrors.status = "Status is required";
    if (!values.created_at && values.created_at !== 0 && values.created_at !== false) nextErrors.created_at = "Created At is required";
    if (!values.updated_at && values.updated_at !== 0 && values.updated_at !== false) nextErrors.updated_at = "Updated At is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = omitKey(values, 'firewall_rule_set_id');
      if (isEdit) {
        await firewallRuleSetService.update(id as never, payload as never);
        toast.success('Firewall Rule Set updated successfully');
        navigate(`/firewall-rule-sets/${id}`);
      } else {
        const created = (await firewallRuleSetService.create(payload as never)) as FirewallRuleSet;
        toast.success('Firewall Rule Set created successfully');
        navigate(`/firewall-rule-sets/${created.firewall_rule_set_id}`);
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
        to={isEdit ? `/firewall-rule-sets/${id}` : '/firewall-rule-sets'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isEdit ? 'Edit Firewall Rule Set' : 'New Firewall Rule Set'}</h1>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEdit && (
          <>
        <NumberField
          name="firewall_rule_set_id"
          label={"Firewall Rule Set Id"}
          value={typeof values.firewall_rule_set_id === 'number' ? values.firewall_rule_set_id : ''}
          onChange={(v) => set('firewall_rule_set_id', v)}
          required={false}
          error={errors.firewall_rule_set_id}
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
        <TextAreaField
          name="description"
          label={"Description"}
          value={String(values.description ?? '')}
          onChange={(v) => set('description', v)}
          required={false}
          error={errors.description}
          disabled={false}
        />
        <FKSelectField
          name="network_security_group_id"
          label={"Network Security Group Id"}
          value={String(values.network_security_group_id ?? '')}
          onChange={(v) => set('network_security_group_id', v === '' ? '' : Number(v))}
          options={network_security_group_idOptions}
          required={false}
          error={errors.network_security_group_id}
          disabled={false}
        />
        <FKSelectField
          name="appliance_id"
          label={"Appliance Id"}
          value={String(values.appliance_id ?? '')}
          onChange={(v) => set('appliance_id', v === '' ? '' : Number(v))}
          options={appliance_idOptions}
          required={false}
          error={errors.appliance_id}
          disabled={false}
        />
        <FKSelectField
          name="protected_system_id"
          label={"Protected System Id"}
          value={String(values.protected_system_id ?? '')}
          onChange={(v) => set('protected_system_id', v === '' ? '' : Number(v))}
          options={protected_system_idOptions}
          required={false}
          error={errors.protected_system_id}
          disabled={false}
        />
        <NumberField
          name="rule_count"
          label={"Rule Count"}
          value={typeof values.rule_count === 'number' ? values.rule_count : ''}
          onChange={(v) => set('rule_count', v)}
          required={true}
          error={errors.rule_count}
          disabled={false}
        />
        <SelectField
          name="status"
          label={"Status"}
          value={String(values.status ?? '')}
          onChange={(v) => set('status', v)}
          options={['Active', 'Under Review', 'Deprecated', 'Archived']}
          required={true}
          error={errors.status}
          disabled={false}
        />
        <DateField
          name="last_reviewed_at"
          label={"Last Reviewed At"}
          value={toDateInputValue(values.last_reviewed_at)}
          onChange={(v) => set('last_reviewed_at', v)}
          required={false}
          error={errors.last_reviewed_at}
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
            {isEdit ? 'Save changes' : 'Create Firewall Rule Set'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
