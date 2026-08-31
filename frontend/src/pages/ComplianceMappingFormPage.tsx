import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import type { ComplianceMapping } from '../types/ComplianceMapping';
import { complianceMappingService } from '../services/ComplianceMappingService';
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
import { protectedSystemService } from '../services/ProtectedSystemService';
import { firewallRuleSetService } from '../services/FirewallRuleSetService';
import { FileUploadField } from '../components/ui/FileUploadField';

type FormState = Record<string, unknown>;

function emptyForm(): FormState {
  return {
    framework: '',
    control_id: '',
    control_name: '',
    description: '',
    protected_system_id: '',
    firewall_rule_set_id: '',
    compliance_status: '',
    evidence_file: '',
    last_assessed_at: '',
    assessor: '',
    notes: '',
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

export function ComplianceMappingFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [values, setValues] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [protected_system_idOptions, setProtected_system_idOptions] = useState<FKOption[]>([]);
  const [firewall_rule_set_idOptions, setFirewall_rule_set_idOptions] = useState<FKOption[]>([]);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    complianceMappingService.list()
      .then((rows) => {
        const found = rows.find((r) => String(r.compliance_mapping_id) === String(id));
        if (found) setValues({ ...found });
      })
      .catch(() => toast.error('Failed to load Compliance Mapping'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  useEffect(() => {
    protectedSystemService.list()
      .then((rows) => setProtected_system_idOptions(rows.map((r) => ({ value: String(r.protected_system_id), label: `${r.name}` }))))
      .catch(() => setProtected_system_idOptions([]));
  }, []);

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
    if (!values.framework && values.framework !== 0 && values.framework !== false) nextErrors.framework = "Framework is required";
    if (!values.control_id && values.control_id !== 0 && values.control_id !== false) nextErrors.control_id = "Control Id is required";
    if (!values.control_name && values.control_name !== 0 && values.control_name !== false) nextErrors.control_name = "Control Name is required";
    if (!values.compliance_status && values.compliance_status !== 0 && values.compliance_status !== false) nextErrors.compliance_status = "Compliance Status is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = omitKey(values, 'compliance_mapping_id');
      if (isEdit) {
        await complianceMappingService.uploadUpdate(id as never, toFormData(payload));
        toast.success('Compliance Mapping updated successfully');
        navigate(`/compliance-mappings/${id}`);
      } else {
        const created = (await complianceMappingService.uploadCreate(toFormData(payload))) as ComplianceMapping;
        toast.success('Compliance Mapping created successfully');
        navigate(`/compliance-mappings/${created.compliance_mapping_id}`);
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
        to={isEdit ? `/compliance-mappings/${id}` : '/compliance-mappings'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isEdit ? 'Edit Compliance Mapping' : 'New Compliance Mapping'}</h1>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEdit && (
          <>
        <NumberField
          name="compliance_mapping_id"
          label={"Compliance Mapping Id"}
          value={typeof values.compliance_mapping_id === 'number' ? values.compliance_mapping_id : ''}
          onChange={(v) => set('compliance_mapping_id', v)}
          required={false}
          error={errors.compliance_mapping_id}
          disabled={true}
        />
          </>
        )}
        <SelectField
          name="framework"
          label={"Framework"}
          value={String(values.framework ?? '')}
          onChange={(v) => set('framework', v)}
          options={['HIPAA', 'HITRUST', 'NIST 800-53', 'CIS Azure', 'SOC2']}
          required={true}
          error={errors.framework}
          disabled={false}
        />
        <TextField
          name="control_id"
          label={"Control Id"}
          value={String(values.control_id ?? '')}
          onChange={(v) => set('control_id', v)}
          required={true}
          error={errors.control_id}
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
          required={false}
          error={errors.description}
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
        <FKSelectField
          name="firewall_rule_set_id"
          label={"Firewall Rule Set Id"}
          value={String(values.firewall_rule_set_id ?? '')}
          onChange={(v) => set('firewall_rule_set_id', v === '' ? '' : Number(v))}
          options={firewall_rule_set_idOptions}
          required={false}
          error={errors.firewall_rule_set_id}
          disabled={false}
        />
        <SelectField
          name="compliance_status"
          label={"Compliance Status"}
          value={String(values.compliance_status ?? '')}
          onChange={(v) => set('compliance_status', v)}
          options={['Compliant', 'Non-Compliant', 'Partially Compliant', 'Not Assessed']}
          required={true}
          error={errors.compliance_status}
          disabled={false}
        />
        <FileUploadField
          name="evidence_file"
          label={"Evidence File"}
          value={String(values.evidence_file ?? '')}
          fileLabel={values.evidence_file ? "Evidence File" : undefined}
          accept={['.pdf', '.jpg', '.jpeg', '.png']}
          maxSizeMb={10}
          required={false}
          error={errors.evidence_file}
          disabled={false}
          downloadHref={values.evidence_file ? String(values.evidence_file) : undefined}
          onSelect={(file, dataUrl) => {
            const ext = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase() : '';
            if (!['.pdf', '.jpg', '.jpeg', '.png'].includes(ext)) {
              setErrors((prev) => ({ ...prev, evidence_file: `File type not allowed. Allowed: ${['.pdf', '.jpg', '.jpeg', '.png'].join(', ')}` }));
              return;
            }
            if (file.size > 10 * 1024 * 1024) {
              setErrors((prev) => ({ ...prev, evidence_file: 'File must be smaller than 10MB' }));
              return;
            }
            setErrors((prev) => {
              const next = { ...prev };
              delete next.evidence_file;
              return next;
            });
            set('evidence_file', dataUrl);
          }}
          onRemove={() => {
            set('evidence_file', '');
          }}
        />
        <DateField
          name="last_assessed_at"
          label={"Last Assessed At"}
          value={toDateInputValue(values.last_assessed_at)}
          onChange={(v) => set('last_assessed_at', v)}
          required={false}
          error={errors.last_assessed_at}
          disabled={false}
        />
        <TextField
          name="assessor"
          label={"Assessor"}
          value={String(values.assessor ?? '')}
          onChange={(v) => set('assessor', v)}
          required={false}
          error={errors.assessor}
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
            {isEdit ? 'Save changes' : 'Create Compliance Mapping'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
