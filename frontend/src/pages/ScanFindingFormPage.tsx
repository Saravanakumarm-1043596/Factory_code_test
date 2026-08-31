import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import type { ScanFinding } from '../types/ScanFinding';
import { scanFindingService } from '../services/ScanFindingService';
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
import { auditScanService } from '../services/AuditScanService';
import { ruleIssueService } from '../services/RuleIssueService';
import { firewallRuleService } from '../services/FirewallRuleService';

type FormState = Record<string, unknown>;

function emptyForm(): FormState {
  return {
    audit_scan_id: '',
    rule_issue_id: '',
    firewall_rule_id: '',
    finding_type: '',
    severity: '',
    detail: '',
    auto_resolved: false,
    detected_at: '',
  };
}

function omitKey<T extends Record<string, unknown>>(obj: T, key: string): Record<string, unknown> {
  const { [key]: _omitted, ...rest } = obj;
  return rest;
}

export function ScanFindingFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [values, setValues] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [audit_scan_idOptions, setAudit_scan_idOptions] = useState<FKOption[]>([]);
  const [rule_issue_idOptions, setRule_issue_idOptions] = useState<FKOption[]>([]);
  const [firewall_rule_idOptions, setFirewall_rule_idOptions] = useState<FKOption[]>([]);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    scanFindingService.list()
      .then((rows) => {
        const found = rows.find((r) => String(r.scan_finding_id) === String(id));
        if (found) setValues({ ...found });
      })
      .catch(() => toast.error('Failed to load Scan Finding'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  useEffect(() => {
    auditScanService.list()
      .then((rows) => setAudit_scan_idOptions(rows.map((r) => ({ value: String(r.audit_scan_id), label: `${r.scan_name}` }))))
      .catch(() => setAudit_scan_idOptions([]));
  }, []);

  useEffect(() => {
    ruleIssueService.list()
      .then((rows) => setRule_issue_idOptions(rows.map((r) => ({ value: String(r.rule_issue_id), label: `${r.recommendation}` }))))
      .catch(() => setRule_issue_idOptions([]));
  }, []);

  useEffect(() => {
    firewallRuleService.list()
      .then((rows) => setFirewall_rule_idOptions(rows.map((r) => ({ value: String(r.firewall_rule_id), label: `${r.rule_name}` }))))
      .catch(() => setFirewall_rule_idOptions([]));
  }, []);

  function set(name: string, value: unknown) {
    setValues((s) => ({ ...s, [name]: value }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!values.audit_scan_id && values.audit_scan_id !== 0 && values.audit_scan_id !== false) nextErrors.audit_scan_id = "Audit Scan Id is required";
    if (!values.firewall_rule_id && values.firewall_rule_id !== 0 && values.firewall_rule_id !== false) nextErrors.firewall_rule_id = "Firewall Rule Id is required";
    if (!values.finding_type && values.finding_type !== 0 && values.finding_type !== false) nextErrors.finding_type = "Finding Type is required";
    if (!values.severity && values.severity !== 0 && values.severity !== false) nextErrors.severity = "Severity is required";
    if (!values.detail && values.detail !== 0 && values.detail !== false) nextErrors.detail = "Detail is required";
    if (!values.auto_resolved && values.auto_resolved !== 0 && values.auto_resolved !== false) nextErrors.auto_resolved = "Auto Resolved is required";
    if (!values.detected_at && values.detected_at !== 0 && values.detected_at !== false) nextErrors.detected_at = "Detected At is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = omitKey(values, 'scan_finding_id');
      if (isEdit) {
        await scanFindingService.update(id as never, payload as never);
        toast.success('Scan Finding updated successfully');
        navigate(`/scan-findings/${id}`);
      } else {
        const created = (await scanFindingService.create(payload as never)) as ScanFinding;
        toast.success('Scan Finding created successfully');
        navigate(`/scan-findings/${created.scan_finding_id}`);
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
        to={isEdit ? `/scan-findings/${id}` : '/scan-findings'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isEdit ? 'Edit Scan Finding' : 'New Scan Finding'}</h1>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEdit && (
          <>
        <NumberField
          name="scan_finding_id"
          label={"Scan Finding Id"}
          value={typeof values.scan_finding_id === 'number' ? values.scan_finding_id : ''}
          onChange={(v) => set('scan_finding_id', v)}
          required={false}
          error={errors.scan_finding_id}
          disabled={true}
        />
          </>
        )}
        <FKSelectField
          name="audit_scan_id"
          label={"Audit Scan Id"}
          value={String(values.audit_scan_id ?? '')}
          onChange={(v) => set('audit_scan_id', v === '' ? '' : Number(v))}
          options={audit_scan_idOptions}
          required={true}
          error={errors.audit_scan_id}
          disabled={false}
        />
        <FKSelectField
          name="rule_issue_id"
          label={"Rule Issue Id"}
          value={String(values.rule_issue_id ?? '')}
          onChange={(v) => set('rule_issue_id', v === '' ? '' : Number(v))}
          options={rule_issue_idOptions}
          required={false}
          error={errors.rule_issue_id}
          disabled={false}
        />
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
        <SelectField
          name="finding_type"
          label={"Finding Type"}
          value={String(values.finding_type ?? '')}
          onChange={(v) => set('finding_type', v)}
          options={['Redundant', 'Shadowed', 'Conflicting', 'Overly Permissive', 'Orphaned', 'Expired']}
          required={true}
          error={errors.finding_type}
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
        <TextField
          name="detail"
          label={"Detail"}
          value={String(values.detail ?? '')}
          onChange={(v) => set('detail', v)}
          required={true}
          error={errors.detail}
          disabled={false}
        />
        <CheckboxField
          name="auto_resolved"
          label={"Auto Resolved"}
          value={Boolean(values.auto_resolved)}
          onChange={(v) => set('auto_resolved', v)}
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
        </div>
        <div className="mt-6 flex gap-3">
          <Button onClick={handleSubmit} loading={submitting}>
            {isEdit ? 'Save changes' : 'Create Scan Finding'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
