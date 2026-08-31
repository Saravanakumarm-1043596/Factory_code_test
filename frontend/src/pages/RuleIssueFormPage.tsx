import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import type { RuleIssue } from '../types/RuleIssue';
import { ruleIssueService } from '../services/RuleIssueService';
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
import { firewallRuleService } from '../services/FirewallRuleService';

type FormState = Record<string, unknown>;

function emptyForm(): FormState {
  return {
    firewall_rule_id: '',
    related_rule_id: '',
    issue_type: '',
    severity: '',
    status: '',
    description: '',
    recommendation: '',
    phi_exposure_risk: false,
    detected_at: '',
    resolved_at: '',
    assigned_to: '',
    notes: '',
  };
}

function omitKey<T extends Record<string, unknown>>(obj: T, key: string): Record<string, unknown> {
  const { [key]: _omitted, ...rest } = obj;
  return rest;
}

export function RuleIssueFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [values, setValues] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [firewall_rule_idOptions, setFirewall_rule_idOptions] = useState<FKOption[]>([]);
  const [related_rule_idOptions, setRelated_rule_idOptions] = useState<FKOption[]>([]);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    ruleIssueService.list()
      .then((rows) => {
        const found = rows.find((r) => String(r.rule_issue_id) === String(id));
        if (found) setValues({ ...found });
      })
      .catch(() => toast.error('Failed to load Rule Issue'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  useEffect(() => {
    firewallRuleService.list()
      .then((rows) => setFirewall_rule_idOptions(rows.map((r) => ({ value: String(r.firewall_rule_id), label: `${r.rule_name}` }))))
      .catch(() => setFirewall_rule_idOptions([]));
  }, []);

  useEffect(() => {
    firewallRuleService.list()
      .then((rows) => setRelated_rule_idOptions(rows.map((r) => ({ value: String(r.firewall_rule_id), label: `${r.rule_name}` }))))
      .catch(() => setRelated_rule_idOptions([]));
  }, []);

  function set(name: string, value: unknown) {
    setValues((s) => ({ ...s, [name]: value }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!values.firewall_rule_id && values.firewall_rule_id !== 0 && values.firewall_rule_id !== false) nextErrors.firewall_rule_id = "Firewall Rule Id is required";
    if (!values.issue_type && values.issue_type !== 0 && values.issue_type !== false) nextErrors.issue_type = "Issue Type is required";
    if (!values.severity && values.severity !== 0 && values.severity !== false) nextErrors.severity = "Severity is required";
    if (!values.status && values.status !== 0 && values.status !== false) nextErrors.status = "Status is required";
    if (!values.description && values.description !== 0 && values.description !== false) nextErrors.description = "Description is required";
    if (!values.phi_exposure_risk && values.phi_exposure_risk !== 0 && values.phi_exposure_risk !== false) nextErrors.phi_exposure_risk = "Phi Exposure Risk is required";
    if (!values.detected_at && values.detected_at !== 0 && values.detected_at !== false) nextErrors.detected_at = "Detected At is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = omitKey(values, 'rule_issue_id');
      if (isEdit) {
        await ruleIssueService.update(id as never, payload as never);
        toast.success('Rule Issue updated successfully');
        navigate(`/rule-issues/${id}`);
      } else {
        const created = (await ruleIssueService.create(payload as never)) as RuleIssue;
        toast.success('Rule Issue created successfully');
        navigate(`/rule-issues/${created.rule_issue_id}`);
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
        to={isEdit ? `/rule-issues/${id}` : '/rule-issues'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isEdit ? 'Edit Rule Issue' : 'New Rule Issue'}</h1>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEdit && (
          <>
        <NumberField
          name="rule_issue_id"
          label={"Rule Issue Id"}
          value={typeof values.rule_issue_id === 'number' ? values.rule_issue_id : ''}
          onChange={(v) => set('rule_issue_id', v)}
          required={false}
          error={errors.rule_issue_id}
          disabled={true}
        />
          </>
        )}
        <FKSelectField
          name="firewall_rule_id"
          label={"Firewall Rule Id"}
          value={String(values.firewall_rule_id ?? '')}
          onChange={(v) => set('firewall_rule_id', v === '' ? '' : Number(v))}
          options={firewall_rule_idOptions}
          required={true}
          error={errors.firewall_rule_id}
          disabled={false}
        />
        <FKSelectField
          name="related_rule_id"
          label={"Related Rule Id"}
          value={String(values.related_rule_id ?? '')}
          onChange={(v) => set('related_rule_id', v === '' ? '' : Number(v))}
          options={related_rule_idOptions}
          required={false}
          error={errors.related_rule_id}
          disabled={false}
        />
        <SelectField
          name="issue_type"
          label={"Issue Type"}
          value={String(values.issue_type ?? '')}
          onChange={(v) => set('issue_type', v)}
          options={['Redundant', 'Shadowed', 'Conflicting', 'Overly Permissive', 'Orphaned', 'Expired']}
          required={true}
          error={errors.issue_type}
          disabled={false}
        />
        <SelectField
          name="severity"
          label={"Severity"}
          value={String(values.severity ?? '')}
          onChange={(v) => set('severity', v)}
          options={['Critical', 'High', 'Medium', 'Low', 'Informational']}
          required={true}
          error={errors.severity}
          disabled={false}
        />
        <SelectField
          name="status"
          label={"Status"}
          value={String(values.status ?? '')}
          onChange={(v) => set('status', v)}
          options={['Open', 'Acknowledged', 'In Remediation', 'Resolved', 'Accepted Risk']}
          required={true}
          error={errors.status}
          disabled={false}
        />
        <TextAreaField
          name="description"
          label={"Description"}
          value={String(values.description ?? '')}
          onChange={(v) => set('description', v)}
          required={true}
          error={errors.description}
          disabled={false}
        />
        <TextField
          name="recommendation"
          label={"Recommendation"}
          value={String(values.recommendation ?? '')}
          onChange={(v) => set('recommendation', v)}
          required={false}
          error={errors.recommendation}
          disabled={false}
        />
        <CheckboxField
          name="phi_exposure_risk"
          label={"Phi Exposure Risk"}
          value={Boolean(values.phi_exposure_risk)}
          onChange={(v) => set('phi_exposure_risk', v)}
          disabled={false}
        />
        <DateField
          name="detected_at"
          label={"Detected At"}
          value={toDateInputValue(values.detected_at)}
          onChange={(v) => set('detected_at', v)}
          required={true}
          error={errors.detected_at}
          disabled={false}
        />
        <DateField
          name="resolved_at"
          label={"Resolved At"}
          value={toDateInputValue(values.resolved_at)}
          onChange={(v) => set('resolved_at', v)}
          required={false}
          error={errors.resolved_at}
          disabled={false}
        />
        <TextField
          name="assigned_to"
          label={"Assigned To"}
          value={String(values.assigned_to ?? '')}
          onChange={(v) => set('assigned_to', v)}
          required={false}
          error={errors.assigned_to}
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
            {isEdit ? 'Save changes' : 'Create Rule Issue'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
