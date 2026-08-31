import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import type { AuditScan } from '../types/AuditScan';
import { auditScanService } from '../services/AuditScanService';
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
    scan_name: '',
    scan_type: '',
    status: '',
    scope_description: '',
    total_rules_analyzed: '',
    issues_found: '',
    critical_issues_found: '',
    initiated_by: '',
    report_file: '',
    started_at: '',
    completed_at: '',
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

export function AuditScanFormPage() {
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
    auditScanService.list()
      .then((rows) => {
        const found = rows.find((r) => String(r.audit_scan_id) === String(id));
        if (found) setValues({ ...found });
      })
      .catch(() => toast.error('Failed to load Audit Scan'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function set(name: string, value: unknown) {
    setValues((s) => ({ ...s, [name]: value }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!values.scan_name && values.scan_name !== 0 && values.scan_name !== false) nextErrors.scan_name = "Scan Name is required";
    if (!values.scan_type && values.scan_type !== 0 && values.scan_type !== false) nextErrors.scan_type = "Scan Type is required";
    if (!values.status && values.status !== 0 && values.status !== false) nextErrors.status = "Status is required";
    if (!values.initiated_by && values.initiated_by !== 0 && values.initiated_by !== false) nextErrors.initiated_by = "Initiated By is required";
    if (!values.started_at && values.started_at !== 0 && values.started_at !== false) nextErrors.started_at = "Started At is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = omitKey(values, 'audit_scan_id');
      if (isEdit) {
        await auditScanService.uploadUpdate(id as never, toFormData(payload));
        toast.success('Audit Scan updated successfully');
        navigate(`/audit-scans/${id}`);
      } else {
        const created = (await auditScanService.uploadCreate(toFormData(payload))) as AuditScan;
        toast.success('Audit Scan created successfully');
        navigate(`/audit-scans/${created.audit_scan_id}`);
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
        to={isEdit ? `/audit-scans/${id}` : '/audit-scans'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isEdit ? 'Edit Audit Scan' : 'New Audit Scan'}</h1>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEdit && (
          <>
        <NumberField
          name="audit_scan_id"
          label={"Audit Scan Id"}
          value={typeof values.audit_scan_id === 'number' ? values.audit_scan_id : ''}
          onChange={(v) => set('audit_scan_id', v)}
          required={false}
          error={errors.audit_scan_id}
          disabled={true}
        />
          </>
        )}
        <TextField
          name="scan_name"
          label={"Scan Name"}
          value={String(values.scan_name ?? '')}
          onChange={(v) => set('scan_name', v)}
          required={true}
          error={errors.scan_name}
          disabled={false}
        />
        <SelectField
          name="scan_type"
          label={"Scan Type"}
          value={String(values.scan_type ?? '')}
          onChange={(v) => set('scan_type', v)}
          options={['Full', 'Incremental', 'Targeted', 'Compliance']}
          required={true}
          error={errors.scan_type}
          disabled={false}
        />
        <SelectField
          name="status"
          label={"Status"}
          value={String(values.status ?? '')}
          onChange={(v) => set('status', v)}
          options={['Scheduled', 'Running', 'Completed', 'Failed']}
          required={true}
          error={errors.status}
          disabled={false}
        />
        <TextAreaField
          name="scope_description"
          label={"Scope Description"}
          value={String(values.scope_description ?? '')}
          onChange={(v) => set('scope_description', v)}
          required={false}
          error={errors.scope_description}
          disabled={false}
        />
        <NumberField
          name="total_rules_analyzed"
          label={"Total Rules Analyzed"}
          value={typeof values.total_rules_analyzed === 'number' ? values.total_rules_analyzed : ''}
          onChange={(v) => set('total_rules_analyzed', v)}
          required={false}
          error={errors.total_rules_analyzed}
          disabled={false}
        />
        <NumberField
          name="issues_found"
          label={"Issues Found"}
          value={typeof values.issues_found === 'number' ? values.issues_found : ''}
          onChange={(v) => set('issues_found', v)}
          required={false}
          error={errors.issues_found}
          disabled={false}
        />
        <NumberField
          name="critical_issues_found"
          label={"Critical Issues Found"}
          value={typeof values.critical_issues_found === 'number' ? values.critical_issues_found : ''}
          onChange={(v) => set('critical_issues_found', v)}
          required={false}
          error={errors.critical_issues_found}
          disabled={false}
        />
        <TextField
          name="initiated_by"
          label={"Initiated By"}
          value={String(values.initiated_by ?? '')}
          onChange={(v) => set('initiated_by', v)}
          required={true}
          error={errors.initiated_by}
          disabled={false}
        />
        <FileUploadField
          name="report_file"
          label={"Report File"}
          value={String(values.report_file ?? '')}
          fileLabel={values.report_file ? "Report File" : undefined}
          accept={['.pdf', '.jpg', '.jpeg', '.png']}
          maxSizeMb={10}
          required={false}
          error={errors.report_file}
          disabled={false}
          downloadHref={values.report_file ? String(values.report_file) : undefined}
          onSelect={(file, dataUrl) => {
            const ext = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase() : '';
            if (!['.pdf', '.jpg', '.jpeg', '.png'].includes(ext)) {
              setErrors((prev) => ({ ...prev, report_file: `File type not allowed. Allowed: ${['.pdf', '.jpg', '.jpeg', '.png'].join(', ')}` }));
              return;
            }
            if (file.size > 10 * 1024 * 1024) {
              setErrors((prev) => ({ ...prev, report_file: 'File must be smaller than 10MB' }));
              return;
            }
            setErrors((prev) => {
              const next = { ...prev };
              delete next.report_file;
              return next;
            });
            set('report_file', dataUrl);
          }}
          onRemove={() => {
            set('report_file', '');
          }}
        />
        <DateField
          name="started_at"
          label={"Started At"}
          value={toDateInputValue(values.started_at)}
          onChange={(v) => set('started_at', v)}
          required={true}
          error={errors.started_at}
          disabled={false}
        />
        <DateField
          name="completed_at"
          label={"Completed At"}
          value={toDateInputValue(values.completed_at)}
          onChange={(v) => set('completed_at', v)}
          required={false}
          error={errors.completed_at}
          disabled={false}
        />
        </div>
        <div className="mt-6 flex gap-3">
          <Button onClick={handleSubmit} loading={submitting}>
            {isEdit ? 'Save changes' : 'Create Audit Scan'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
