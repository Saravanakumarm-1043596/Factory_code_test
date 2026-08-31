import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import type { ChangeRequest } from '../types/ChangeRequest';
import { changeRequestService } from '../services/ChangeRequestService';
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
import { ruleIssueService } from '../services/RuleIssueService';
import { FileUploadField } from '../components/ui/FileUploadField';

type FormState = Record<string, unknown>;

function emptyForm(): FormState {
  return {
    title: '',
    description: '',
    firewall_rule_set_id: '',
    change_type: '',
    status: '',
    priority: '',
    requestor: '',
    approver: '',
    justification: '',
    risk_assessment: '',
    rule_issue_id: '',
    implementation_notes: '',
    attachment: '',
    submitted_at: '',
    approved_at: '',
    implemented_at: '',
    created_at: '',
  };
}

function omitKey<T extends Record<string, unknown>>(obj: T, key: string): Record<string, unknown> {
  const { [key]: _omitted, ...rest } = obj;
  return rest;
}

function toFormData(obj: Record<string, unknown>): FormData {
  const fd = new FormData();
  Object.entries(obj).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    fd.append(key, typeof value === 'boolean' ? String(value) : String(value));
  });
  return fd;
}

export function ChangeRequestFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [values, setValues] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [firewall_rule_set_idOptions, setFirewall_rule_set_idOptions] = useState<FKOption[]>([]);
  const [rule_issue_idOptions, setRule_issue_idOptions] = useState<FKOption[]>([]);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    changeRequestService.list()
      .then((rows) => {
        const found = rows.find((r) => String(r.change_request_id) === String(id));
        if (found) setValues({ ...found });
      })
      .catch(() => toast.error('Failed to load Change Request'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  useEffect(() => {
    firewallRuleSetService.list()
      .then((rows) => setFirewall_rule_set_idOptions(rows.map((r) => ({ value: String(r.firewall_rule_set_id), label: `${r.name}` }))))
      .catch(() => setFirewall_rule_set_idOptions([]));
  }, []);

  useEffect(() => {
    ruleIssueService.list()
      .then((rows) => setRule_issue_idOptions(rows.map((r) => ({ value: String(r.rule_issue_id), label: `${r.recommendation}` }))))
      .catch(() => setRule_issue_idOptions([]));
  }, []);

  function set(name: string, value: unknown) {
    setValues((s) => ({ ...s, [name]: value }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!values.title && values.title !== 0 && values.title !== false) nextErrors.title = "Title is required";
    if (!values.description && values.description !== 0 && values.description !== false) nextErrors.description = "Description is required";
    if (!values.firewall_rule_set_id && values.firewall_rule_set_id !== 0 && values.firewall_rule_set_id !== false) nextErrors.firewall_rule_set_id = "Firewall Rule Set Id is required";
    if (!values.change_type && values.change_type !== 0 && values.change_type !== false) nextErrors.change_type = "Change Type is required";
    if (!values.status && values.status !== 0 && values.status !== false) nextErrors.status = "Status is required";
    if (!values.priority && values.priority !== 0 && values.priority !== false) nextErrors.priority = "Priority is required";
    if (!values.requestor && values.requestor !== 0 && values.requestor !== false) nextErrors.requestor = "Requestor is required";
    if (!values.justification && values.justification !== 0 && values.justification !== false) nextErrors.justification = "Justification is required";
    if (!values.created_at && values.created_at !== 0 && values.created_at !== false) nextErrors.created_at = "Created At is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = omitKey(values, 'change_request_id');
      if (isEdit) {
        await changeRequestService.uploadUpdate(id as never, toFormData(payload));
        toast.success('Change Request updated successfully');
        navigate(`/change-requests/${id}`);
      } else {
        const created = (await changeRequestService.uploadCreate(toFormData(payload))) as ChangeRequest;
        toast.success('Change Request created successfully');
        navigate(`/change-requests/${created.change_request_id}`);
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
        to={isEdit ? `/change-requests/${id}` : '/change-requests'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isEdit ? 'Edit Change Request' : 'New Change Request'}</h1>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEdit && (
          <>
        <NumberField
          name="change_request_id"
          label={"Change Request Id"}
          value={typeof values.change_request_id === 'number' ? values.change_request_id : ''}
          onChange={(v) => set('change_request_id', v)}
          required={false}
          error={errors.change_request_id}
          disabled={true}
        />
          </>
        )}
        <TextField
          name="title"
          label={"Title"}
          value={String(values.title ?? '')}
          onChange={(v) => set('title', v)}
          required={true}
          error={errors.title}
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
        <SelectField
          name="change_type"
          label={"Change Type"}
          value={String(values.change_type ?? '')}
          onChange={(v) => set('change_type', v)}
          options={['Add Rule', 'Modify Rule', 'Remove Rule', 'Consolidate Rules', 'Emergency Change']}
          required={true}
          error={errors.change_type}
          disabled={false}
        />
        <SelectField
          name="status"
          label={"Status"}
          value={String(values.status ?? '')}
          onChange={(v) => set('status', v)}
          options={['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Implemented', 'Rolled Back']}
          required={true}
          error={errors.status}
          disabled={false}
        />
        <SelectField
          name="priority"
          label={"Priority"}
          value={String(values.priority ?? '')}
          onChange={(v) => set('priority', v)}
          options={['Critical', 'High', 'Medium', 'Low']}
          required={true}
          error={errors.priority}
          disabled={false}
        />
        <TextField
          name="requestor"
          label={"Requestor"}
          value={String(values.requestor ?? '')}
          onChange={(v) => set('requestor', v)}
          required={true}
          error={errors.requestor}
          disabled={false}
        />
        <TextField
          name="approver"
          label={"Approver"}
          value={String(values.approver ?? '')}
          onChange={(v) => set('approver', v)}
          required={false}
          error={errors.approver}
          disabled={false}
        />
        <TextField
          name="justification"
          label={"Justification"}
          value={String(values.justification ?? '')}
          onChange={(v) => set('justification', v)}
          required={true}
          error={errors.justification}
          disabled={false}
        />
        <TextField
          name="risk_assessment"
          label={"Risk Assessment"}
          value={String(values.risk_assessment ?? '')}
          onChange={(v) => set('risk_assessment', v)}
          required={false}
          error={errors.risk_assessment}
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
        <TextAreaField
          name="implementation_notes"
          label={"Implementation Notes"}
          value={String(values.implementation_notes ?? '')}
          onChange={(v) => set('implementation_notes', v)}
          required={false}
          error={errors.implementation_notes}
          disabled={false}
        />
        <FileUploadField
          name="attachment"
          label={"Attachment"}
          value={String(values.attachment ?? '')}
          fileLabel={values.attachment ? "Attachment" : undefined}
          accept={['.pdf', '.jpg', '.jpeg', '.png']}
          maxSizeMb={10}
          required={false}
          error={errors.attachment}
          disabled={false}
          downloadHref={values.attachment ? String(values.attachment) : undefined}
          onSelect={(file, dataUrl) => {
            const ext = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase() : '';
            if (!['.pdf', '.jpg', '.jpeg', '.png'].includes(ext)) {
              setErrors((prev) => ({ ...prev, attachment: `File type not allowed. Allowed: ${['.pdf', '.jpg', '.jpeg', '.png'].join(', ')}` }));
              return;
            }
            if (file.size > 10 * 1024 * 1024) {
              setErrors((prev) => ({ ...prev, attachment: 'File must be smaller than 10MB' }));
              return;
            }
            setErrors((prev) => {
              const next = { ...prev };
              delete next.attachment;
              return next;
            });
            set('attachment', dataUrl);
          }}
          onRemove={() => {
            set('attachment', '');
          }}
        />
        <DateField
          name="submitted_at"
          label={"Submitted At"}
          value={toDateInputValue(values.submitted_at)}
          onChange={(v) => set('submitted_at', v)}
          required={false}
          error={errors.submitted_at}
          disabled={false}
        />
        <DateField
          name="approved_at"
          label={"Approved At"}
          value={toDateInputValue(values.approved_at)}
          onChange={(v) => set('approved_at', v)}
          required={false}
          error={errors.approved_at}
          disabled={false}
        />
        <DateField
          name="implemented_at"
          label={"Implemented At"}
          value={toDateInputValue(values.implemented_at)}
          onChange={(v) => set('implemented_at', v)}
          required={false}
          error={errors.implemented_at}
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
            {isEdit ? 'Save changes' : 'Create Change Request'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
