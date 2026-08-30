import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import type { ComplianceControl } from '../types/ComplianceControl';
import { complianceControlService } from '../services/ComplianceControlService';
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
import { FileUploadField } from '../components/ui/FileUploadField';

type FormState = Record<string, unknown>;

function emptyForm(): FormState {
  return {
    control_framework: '',
    control_identifier: '',
    control_name: '',
    description: '',
    control_category: '',
    status: '',
    risk_level: '',
    last_assessment_date: '',
    next_assessment_date: '',
    responsible_party: '',
    evidence_document: '',
    remediation_notes: '',
    created_at: '',
    updated_at: '',
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

export function ComplianceControlFormPage() {
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
    complianceControlService.list()
      .then((rows) => {
        const found = rows.find((r) => String(r.compliance_control_id) === String(id));
        if (found) setValues({ ...found });
      })
      .catch(() => toast.error('Failed to load Compliance Control'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function set(name: string, value: unknown) {
    setValues((s) => ({ ...s, [name]: value }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!values.control_framework && values.control_framework !== 0 && values.control_framework !== false) nextErrors.control_framework = "Control Framework is required";
    if (!values.control_identifier && values.control_identifier !== 0 && values.control_identifier !== false) nextErrors.control_identifier = "Control Identifier is required";
    if (!values.control_name && values.control_name !== 0 && values.control_name !== false) nextErrors.control_name = "Control Name is required";
    if (!values.description && values.description !== 0 && values.description !== false) nextErrors.description = "Description is required";
    if (!values.control_category && values.control_category !== 0 && values.control_category !== false) nextErrors.control_category = "Control Category is required";
    if (!values.status && values.status !== 0 && values.status !== false) nextErrors.status = "Status is required";
    if (!values.risk_level && values.risk_level !== 0 && values.risk_level !== false) nextErrors.risk_level = "Risk Level is required";
    if (!values.responsible_party && values.responsible_party !== 0 && values.responsible_party !== false) nextErrors.responsible_party = "Responsible Party is required";
    if (!values.created_at && values.created_at !== 0 && values.created_at !== false) nextErrors.created_at = "Created At is required";
    if (!values.updated_at && values.updated_at !== 0 && values.updated_at !== false) nextErrors.updated_at = "Updated At is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = omitKey(values, 'compliance_control_id');
      if (isEdit) {
        await complianceControlService.uploadUpdate(id as never, toFormData(payload));
        toast.success('Compliance Control updated successfully');
        navigate(`/compliance-controls/${id}`);
      } else {
        const created = (await complianceControlService.uploadCreate(toFormData(payload))) as ComplianceControl;
        toast.success('Compliance Control created successfully');
        navigate(`/compliance-controls/${created.compliance_control_id}`);
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
        to={isEdit ? `/compliance-controls/${id}` : '/compliance-controls'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isEdit ? 'Edit Compliance Control' : 'New Compliance Control'}</h1>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEdit && (
          <>
        <NumberField
          name="compliance_control_id"
          label={"Compliance Control Id"}
          value={typeof values.compliance_control_id === 'number' ? values.compliance_control_id : ''}
          onChange={(v) => set('compliance_control_id', v)}
          required={false}
          error={errors.compliance_control_id}
          disabled={true}
        />
          </>
        )}
        <SelectField
          name="control_framework"
          label={"Control Framework"}
          value={String(values.control_framework ?? '')}
          onChange={(v) => set('control_framework', v)}
          options={['HIPAA §164.312', 'HITRUST CSF 09.x', 'Internal Policy']}
          required={true}
          error={errors.control_framework}
          disabled={false}
        />
        <TextField
          name="control_identifier"
          label={"Control Identifier"}
          value={String(values.control_identifier ?? '')}
          onChange={(v) => set('control_identifier', v)}
          required={true}
          error={errors.control_identifier}
          disabled={false}
        />
        <TextField
          name="control_name"
          label={"Control Name"}
          value={String(values.control_name ?? '')}
          onChange={(v) => set('control_name', v)}
          required={true}
          error={errors.control_name}
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
          name="control_category"
          label={"Control Category"}
          value={String(values.control_category ?? '')}
          onChange={(v) => set('control_category', v)}
          options={['Access Control', 'Audit Controls', 'Integrity', 'Transmission Security', 'Encryption', 'Authentication']}
          required={true}
          error={errors.control_category}
          disabled={false}
        />
        <SelectField
          name="status"
          label={"Status"}
          value={String(values.status ?? '')}
          onChange={(v) => set('status', v)}
          options={['Compliant', 'Non-Compliant', 'Partially Compliant', 'Not Assessed']}
          required={true}
          error={errors.status}
          disabled={false}
        />
        <SelectField
          name="risk_level"
          label={"Risk Level"}
          value={String(values.risk_level ?? '')}
          onChange={(v) => set('risk_level', v)}
          options={['Low', 'Medium', 'High', 'Critical']}
          required={true}
          error={errors.risk_level}
          disabled={false}
        />
        <DateField
          name="last_assessment_date"
          label={"Last Assessment Date"}
          value={toDateInputValue(values.last_assessment_date)}
          onChange={(v) => set('last_assessment_date', v)}
          required={false}
          error={errors.last_assessment_date}
          disabled={false}
        />
        <DateField
          name="next_assessment_date"
          label={"Next Assessment Date"}
          value={toDateInputValue(values.next_assessment_date)}
          onChange={(v) => set('next_assessment_date', v)}
          required={false}
          error={errors.next_assessment_date}
          disabled={false}
        />
        <TextField
          name="responsible_party"
          label={"Responsible Party"}
          value={String(values.responsible_party ?? '')}
          onChange={(v) => set('responsible_party', v)}
          required={true}
          error={errors.responsible_party}
          disabled={false}
        />
        <FileUploadField
          name="evidence_document"
          label={"Evidence Document"}
          value={String(values.evidence_document ?? '')}
          fileLabel={values.evidence_document ? "Evidence Document" : undefined}
          accept={['.pdf', '.jpg', '.jpeg', '.png']}
          maxSizeMb={10}
          required={false}
          error={errors.evidence_document}
          disabled={false}
          downloadHref={values.evidence_document ? String(values.evidence_document) : undefined}
          onSelect={(file, dataUrl) => {
            const ext = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase() : '';
            if (!['.pdf', '.jpg', '.jpeg', '.png'].includes(ext)) {
              setErrors((prev) => ({ ...prev, evidence_document: `File type not allowed. Allowed: ${['.pdf', '.jpg', '.jpeg', '.png'].join(', ')}` }));
              return;
            }
            if (file.size > 10 * 1024 * 1024) {
              setErrors((prev) => ({ ...prev, evidence_document: 'File must be smaller than 10MB' }));
              return;
            }
            setErrors((prev) => {
              const next = { ...prev };
              delete next.evidence_document;
              return next;
            });
            set('evidence_document', dataUrl);
          }}
          onRemove={() => {
            set('evidence_document', '');
          }}
        />
        <TextAreaField
          name="remediation_notes"
          label={"Remediation Notes"}
          value={String(values.remediation_notes ?? '')}
          onChange={(v) => set('remediation_notes', v)}
          required={false}
          error={errors.remediation_notes}
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
            {isEdit ? 'Save changes' : 'Create Compliance Control'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
