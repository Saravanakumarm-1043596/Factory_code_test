import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import type { ComplianceFinding } from '../types/ComplianceFinding';
import { complianceFindingService } from '../services/ComplianceFindingService';
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
import { complianceControlService } from '../services/ComplianceControlService';
import { lineOfBusinessService } from '../services/LineOfBusinessService';
import { FileUploadField } from '../components/ui/FileUploadField';

type FormState = Record<string, unknown>;

function emptyForm(): FormState {
  return {
    compliance_control_id: '',
    finding_type: '',
    severity: '',
    description: '',
    affected_system: '',
    affected_line_of_business_id: '',
    status: '',
    assigned_to: '',
    remediation_plan: '',
    due_date: '',
    evidence_attachment: '',
    found_date: '',
    resolved_date: '',
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

export function ComplianceFindingFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [values, setValues] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [compliance_control_idOptions, setCompliance_control_idOptions] = useState<FKOption[]>([]);
  const [affected_line_of_business_idOptions, setAffected_line_of_business_idOptions] = useState<FKOption[]>([]);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    complianceFindingService.list()
      .then((rows) => {
        const found = rows.find((r) => String(r.compliance_finding_id) === String(id));
        if (found) setValues({ ...found });
      })
      .catch(() => toast.error('Failed to load Compliance Finding'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  useEffect(() => {
    complianceControlService.list()
      .then((rows) => setCompliance_control_idOptions(rows.map((r) => ({ value: String(r.compliance_control_id), label: `${r.control_name}` }))))
      .catch(() => setCompliance_control_idOptions([]));
  }, []);

  useEffect(() => {
    lineOfBusinessService.list()
      .then((rows) => setAffected_line_of_business_idOptions(rows.map((r) => ({ value: String(r.line_of_business_id), label: `#${r.line_of_business_id}` }))))
      .catch(() => setAffected_line_of_business_idOptions([]));
  }, []);

  function set(name: string, value: unknown) {
    setValues((s) => ({ ...s, [name]: value }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!values.compliance_control_id && values.compliance_control_id !== 0 && values.compliance_control_id !== false) nextErrors.compliance_control_id = "Compliance Control Id is required";
    if (!values.finding_type && values.finding_type !== 0 && values.finding_type !== false) nextErrors.finding_type = "Finding Type is required";
    if (!values.severity && values.severity !== 0 && values.severity !== false) nextErrors.severity = "Severity is required";
    if (!values.description && values.description !== 0 && values.description !== false) nextErrors.description = "Description is required";
    if (!values.affected_system && values.affected_system !== 0 && values.affected_system !== false) nextErrors.affected_system = "Affected System is required";
    if (!values.status && values.status !== 0 && values.status !== false) nextErrors.status = "Status is required";
    if (!values.found_date && values.found_date !== 0 && values.found_date !== false) nextErrors.found_date = "Found Date is required";
    if (!values.created_at && values.created_at !== 0 && values.created_at !== false) nextErrors.created_at = "Created At is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = omitKey(values, 'compliance_finding_id');
      if (isEdit) {
        await complianceFindingService.uploadUpdate(id as never, toFormData(payload));
        toast.success('Compliance Finding updated successfully');
        navigate(`/compliance-findings/${id}`);
      } else {
        const created = (await complianceFindingService.uploadCreate(toFormData(payload))) as ComplianceFinding;
        toast.success('Compliance Finding created successfully');
        navigate(`/compliance-findings/${created.compliance_finding_id}`);
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
        to={isEdit ? `/compliance-findings/${id}` : '/compliance-findings'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isEdit ? 'Edit Compliance Finding' : 'New Compliance Finding'}</h1>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEdit && (
          <>
        <NumberField
          name="compliance_finding_id"
          label={"Compliance Finding Id"}
          value={typeof values.compliance_finding_id === 'number' ? values.compliance_finding_id : ''}
          onChange={(v) => set('compliance_finding_id', v)}
          required={false}
          error={errors.compliance_finding_id}
          disabled={true}
        />
          </>
        )}
        <FKSelectField
          name="compliance_control_id"
          label={"Compliance Control Id"}
          value={String(values.compliance_control_id ?? '')}
          onChange={(v) => set('compliance_control_id', v === '' ? '' : Number(v))}
          options={compliance_control_idOptions}
          required={true}
          error={errors.compliance_control_id}
          disabled={false}
        />
        <SelectField
          name="finding_type"
          label={"Finding Type"}
          value={String(values.finding_type ?? '')}
          onChange={(v) => set('finding_type', v)}
          options={['Gap', 'Violation', 'Observation', 'Improvement Opportunity']}
          required={true}
          error={errors.finding_type}
          disabled={false}
        />
        <SelectField
          name="severity"
          label={"Severity"}
          value={String(values.severity ?? '')}
          onChange={(v) => set('severity', v)}
          options={['Low', 'Medium', 'High', 'Critical']}
          required={true}
          error={errors.severity}
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
        <SelectField
          name="affected_system"
          label={"Affected System"}
          value={String(values.affected_system ?? '')}
          onChange={(v) => set('affected_system', v)}
          options={['Facets', 'Epic', 'Cross-System', 'This Application']}
          required={true}
          error={errors.affected_system}
          disabled={false}
        />
        <FKSelectField
          name="affected_line_of_business_id"
          label={"Affected Line Of Business Id"}
          value={String(values.affected_line_of_business_id ?? '')}
          onChange={(v) => set('affected_line_of_business_id', v === '' ? '' : Number(v))}
          options={affected_line_of_business_idOptions}
          required={false}
          error={errors.affected_line_of_business_id}
          disabled={false}
        />
        <SelectField
          name="status"
          label={"Status"}
          value={String(values.status ?? '')}
          onChange={(v) => set('status', v)}
          options={['Open', 'In Remediation', 'Remediated', 'Accepted Risk', 'Closed']}
          required={true}
          error={errors.status}
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
        <SelectField
          name="remediation_plan"
          label={"Remediation Plan"}
          value={String(values.remediation_plan ?? '')}
          onChange={(v) => set('remediation_plan', v)}
          options={['Gold PPO', 'Silver HMO', 'Bronze EPO', 'Medicare Advantage', 'Medicaid Managed Care']}
          required={false}
          error={errors.remediation_plan}
          disabled={false}
        />
        <DateField
          name="due_date"
          label={"Due Date"}
          value={toDateInputValue(values.due_date)}
          onChange={(v) => set('due_date', v)}
          required={false}
          error={errors.due_date}
          disabled={false}
        />
        <FileUploadField
          name="evidence_attachment"
          label={"Evidence Attachment"}
          value={String(values.evidence_attachment ?? '')}
          fileLabel={values.evidence_attachment ? "Evidence Attachment" : undefined}
          accept={['.pdf', '.jpg', '.jpeg', '.png']}
          maxSizeMb={10}
          required={false}
          error={errors.evidence_attachment}
          disabled={false}
          downloadHref={values.evidence_attachment ? String(values.evidence_attachment) : undefined}
          onSelect={(file, dataUrl) => {
            const ext = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase() : '';
            if (!['.pdf', '.jpg', '.jpeg', '.png'].includes(ext)) {
              setErrors((prev) => ({ ...prev, evidence_attachment: `File type not allowed. Allowed: ${['.pdf', '.jpg', '.jpeg', '.png'].join(', ')}` }));
              return;
            }
            if (file.size > 10 * 1024 * 1024) {
              setErrors((prev) => ({ ...prev, evidence_attachment: 'File must be smaller than 10MB' }));
              return;
            }
            setErrors((prev) => {
              const next = { ...prev };
              delete next.evidence_attachment;
              return next;
            });
            set('evidence_attachment', dataUrl);
          }}
          onRemove={() => {
            set('evidence_attachment', '');
          }}
        />
        <DateField
          name="found_date"
          label={"Found Date"}
          value={toDateInputValue(values.found_date)}
          onChange={(v) => set('found_date', v)}
          required={true}
          error={errors.found_date}
          disabled={false}
        />
        <DateField
          name="resolved_date"
          label={"Resolved Date"}
          value={toDateInputValue(values.resolved_date)}
          onChange={(v) => set('resolved_date', v)}
          required={false}
          error={errors.resolved_date}
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
            {isEdit ? 'Save changes' : 'Create Compliance Finding'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
