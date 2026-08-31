import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import type { FirewallRule } from '../types/FirewallRule';
import { firewallRuleService } from '../services/FirewallRuleService';
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
import { firewallRuleSetService } from '../services/FirewallRuleSetService';

type FormState = Record<string, unknown>;

function emptyForm(): FormState {
  return {
    firewall_rule_set_id: '',
    rule_name: '',
    priority: '',
    direction: '',
    action: '',
    protocol: '',
    source_address: '',
    source_port_range: '',
    destination_address: '',
    destination_port_range: '',
    is_enabled: false,
    description: '',
    last_hit_at: '',
    hit_count: '',
    created_at: '',
  };
}

function omitKey<T extends Record<string, unknown>>(obj: T, key: string): Record<string, unknown> {
  const { [key]: _omitted, ...rest } = obj;
  return rest;
}

export function FirewallRuleFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [values, setValues] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [firewall_rule_set_idOptions, setFirewall_rule_set_idOptions] = useState<FKOption[]>([]);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    firewallRuleService.list()
      .then((rows) => {
        const found = rows.find((r) => String(r.firewall_rule_id) === String(id));
        if (found) setValues({ ...found });
      })
      .catch(() => toast.error('Failed to load Firewall Rule'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  useEffect(() => {
    firewallRuleSetService.list()
      .then((rows) => setFirewall_rule_set_idOptions(rows.map((r) => ({ value: String(r.firewall_rule_set_id), label: `${r.name}` }))))
      .catch(() => setFirewall_rule_set_idOptions([]));
  }, []);

  function set(name: string, value: unknown) {
    setValues((s) => ({ ...s, [name]: value }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!values.firewall_rule_set_id && values.firewall_rule_set_id !== 0 && values.firewall_rule_set_id !== false) nextErrors.firewall_rule_set_id = "Firewall Rule Set Id is required";
    if (!values.rule_name && values.rule_name !== 0 && values.rule_name !== false) nextErrors.rule_name = "Rule Name is required";
    if (!values.priority && values.priority !== 0 && values.priority !== false) nextErrors.priority = "Priority is required";
    if (!values.direction && values.direction !== 0 && values.direction !== false) nextErrors.direction = "Direction is required";
    if (!values.action && values.action !== 0 && values.action !== false) nextErrors.action = "Action is required";
    if (!values.protocol && values.protocol !== 0 && values.protocol !== false) nextErrors.protocol = "Protocol is required";
    if (!values.source_address && values.source_address !== 0 && values.source_address !== false) nextErrors.source_address = "Source Address is required";
    if (!values.source_port_range && values.source_port_range !== 0 && values.source_port_range !== false) nextErrors.source_port_range = "Source Port Range is required";
    if (!values.destination_address && values.destination_address !== 0 && values.destination_address !== false) nextErrors.destination_address = "Destination Address is required";
    if (!values.destination_port_range && values.destination_port_range !== 0 && values.destination_port_range !== false) nextErrors.destination_port_range = "Destination Port Range is required";
    if (!values.is_enabled && values.is_enabled !== 0 && values.is_enabled !== false) nextErrors.is_enabled = "Is Enabled is required";
    if (!values.created_at && values.created_at !== 0 && values.created_at !== false) nextErrors.created_at = "Created At is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = omitKey(values, 'firewall_rule_id');
      if (isEdit) {
        await firewallRuleService.update(id as never, payload as never);
        toast.success('Firewall Rule updated successfully');
        navigate(`/firewall-rules/${id}`);
      } else {
        const created = (await firewallRuleService.create(payload as never)) as FirewallRule;
        toast.success('Firewall Rule created successfully');
        navigate(`/firewall-rules/${created.firewall_rule_id}`);
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
        to={isEdit ? `/firewall-rules/${id}` : '/firewall-rules'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isEdit ? 'Edit Firewall Rule' : 'New Firewall Rule'}</h1>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEdit && (
          <>
        <NumberField
          name="firewall_rule_id"
          label={"Firewall Rule Id"}
          value={typeof values.firewall_rule_id === 'number' ? values.firewall_rule_id : ''}
          onChange={(v) => set('firewall_rule_id', v)}
          required={false}
          error={errors.firewall_rule_id}
          disabled={true}
        />
          </>
        )}
        <FKSelectField
          name="firewall_rule_set_id"
          label={"Firewall Rule Set Id"}
          value={String(values.firewall_rule_set_id ?? '')}
          onChange={(v) => set('firewall_rule_set_id', v === '' ? '' : Number(v))}
          options={firewall_rule_set_idOptions}
          required={true}
          error={errors.firewall_rule_set_id}
          disabled={false}
        />
        <TextField
          name="rule_name"
          label={"Rule Name"}
          value={String(values.rule_name ?? '')}
          onChange={(v) => set('rule_name', v)}
          required={true}
          error={errors.rule_name}
          disabled={false}
        />
        <NumberField
          name="priority"
          label={"Priority"}
          value={typeof values.priority === 'number' ? values.priority : ''}
          onChange={(v) => set('priority', v)}
          required={true}
          error={errors.priority}
          disabled={false}
        />
        <SelectField
          name="direction"
          label={"Direction"}
          value={String(values.direction ?? '')}
          onChange={(v) => set('direction', v)}
          options={['Inbound', 'Outbound']}
          required={true}
          error={errors.direction}
          disabled={false}
        />
        <SelectField
          name="action"
          label={"Action"}
          value={String(values.action ?? '')}
          onChange={(v) => set('action', v)}
          options={['Allow', 'Deny']}
          required={true}
          error={errors.action}
          disabled={false}
        />
        <SelectField
          name="protocol"
          label={"Protocol"}
          value={String(values.protocol ?? '')}
          onChange={(v) => set('protocol', v)}
          options={['TCP', 'UDP', 'ICMP', 'Any']}
          required={true}
          error={errors.protocol}
          disabled={false}
        />
        <TextField
          name="source_address"
          label={"Source Address"}
          value={String(values.source_address ?? '')}
          onChange={(v) => set('source_address', v)}
          required={true}
          error={errors.source_address}
          disabled={false}
        />
        <TextField
          name="source_port_range"
          label={"Source Port Range"}
          value={String(values.source_port_range ?? '')}
          onChange={(v) => set('source_port_range', v)}
          required={true}
          error={errors.source_port_range}
          disabled={false}
        />
        <TextField
          name="destination_address"
          label={"Destination Address"}
          value={String(values.destination_address ?? '')}
          onChange={(v) => set('destination_address', v)}
          required={true}
          error={errors.destination_address}
          disabled={false}
        />
        <TextField
          name="destination_port_range"
          label={"Destination Port Range"}
          value={String(values.destination_port_range ?? '')}
          onChange={(v) => set('destination_port_range', v)}
          required={true}
          error={errors.destination_port_range}
          disabled={false}
        />
        <CheckboxField
          name="is_enabled"
          label={"Is Enabled"}
          value={Boolean(values.is_enabled)}
          onChange={(v) => set('is_enabled', v)}
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
        <DateField
          name="last_hit_at"
          label={"Last Hit At"}
          value={toDateInputValue(values.last_hit_at)}
          onChange={(v) => set('last_hit_at', v)}
          required={false}
          error={errors.last_hit_at}
          disabled={false}
        />
        <NumberField
          name="hit_count"
          label={"Hit Count"}
          value={typeof values.hit_count === 'number' ? values.hit_count : ''}
          onChange={(v) => set('hit_count', v)}
          required={false}
          error={errors.hit_count}
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
            {isEdit ? 'Save changes' : 'Create Firewall Rule'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
