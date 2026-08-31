import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import type { BreachIncident } from '../types/BreachIncident';
import { breachIncidentService } from '../services/BreachIncidentService';
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
import { appUserService } from '../services/AppUserService';
import { FileUploadField } from '../components/ui/FileUploadField';

type FormState = Record<string, unknown>;

function emptyForm(): FormState {
  return {
    reported_by_user_id: '',
    severity: '',
    breach_type: '',
    status: '',
    affected_patient_count: '',
    description: '',
    discovered_at: '',
    reported_at: '',
    hhs_notification_deadline: '',
    hhs_notified_at: '',
    patient_notification_sent_at: '',
    root_cause: '',
    remediation_plan: '',
    supporting_document: '',
    resolved_at: '',
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

export function BreachIncidentFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [values, setValues] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [reported_by_user_idOptions, setReported_by_user_idOptions] = useState<FKOption[]>([]);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    breachIncidentService.list()
      .then((rows) => {
        const found = rows.find((r) => String(r.breach_incident_id) === String(id));
        if (found) setValues({ ...found });
      })
      .catch(() => toast.error('Failed to load Breach Incident'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  useEffect(() => {
    appUserService.list()
      .then((rows) => setReported_by_user_idOptions(rows.map((r) => ({ value: String(r.app_user_id), label: `${r.first_name}` }))))
      .catch(() => setReported_by_user_idOptions([]));
  }, []);

  function set(name: string, value: unknown) {
    setValues((s) => ({ ...s, [name]: value }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!values.reported_by_user_id && values.reported_by_user_id !== 0 && values.reported_by_user_id !== false) nextErrors.reported_by_user_id = "Reported By User Id is required";
    if (!values.severity && values.severity !== 0 && values.severity !== false) nextErrors.severity = "Severity is required";
    if (!values.breach_type && values.breach_type !== 0 && values.breach_type !== false) nextErrors.breach_type = "Breach Type is required";
    if (!values.status && values.status !== 0 && values.status !== false) nextErrors.status = "Status is required";
    if (!values.affected_patient_count && values.affected_patient_count !== 0 && values.affected_patient_count !== false) nextErrors.affected_patient_count = "Affected Patient Count is required";
    if (!values.description && values.description !== 0 && values.description !== false) nextErrors.description = "Description is required";
    if (!values.discovered_at && values.discovered_at !== 0 && values.discovered_at !== false) nextErrors.discovered_at = "Discovered At is required";
    if (!values.reported_at && values.reported_at !== 0 && values.reported_at !== false) nextErrors.reported_at = "Reported At is required";
    if (!values.hhs_notification_deadline && values.hhs_notification_deadline !== 0 && values.hhs_notification_deadline !== false) nextErrors.hhs_notification_deadline = "Hhs Notification Deadline is required";
    if (!values.created_at && values.created_at !== 0 && values.created_at !== false) nextErrors.created_at = "Created At is required";
    if (!values.updated_at && values.updated_at !== 0 && values.updated_at !== false) nextErrors.updated_at = "Updated At is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = omitKey(values, 'breach_incident_id');
      if (isEdit) {
        await breachIncidentService.uploadUpdate(id as never, toFormData(payload));
        toast.success('Breach Incident updated successfully');
        navigate(`/breach-incidents/${id}`);
      } else {
        const created = (await breachIncidentService.uploadCreate(toFormData(payload))) as BreachIncident;
        toast.success('Breach Incident created successfully');
        navigate(`/breach-incidents/${created.breach_incident_id}`);
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
        to={isEdit ? `/breach-incidents/${id}` : '/breach-incidents'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isEdit ? 'Edit Breach Incident' : 'New Breach Incident'}</h1>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEdit && (
          <>
        <TextField
          name="breach_incident_id"
          label={"Breach Incident Id"}
          value={String(values.breach_incident_id ?? '')}
          onChange={(v) => set('breach_incident_id', v)}
          required={false}
          error={errors.breach_incident_id}
          disabled={true}
        />
          </>
        )}
        <FKSelectField
          name="reported_by_user_id"
          label={"Reported By User Id"}
          value={String(values.reported_by_user_id ?? '')}
          onChange={(v) => set('reported_by_user_id', v)}
          options={reported_by_user_idOptions}
          required={true}
          error={errors.reported_by_user_id}
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
        <SelectField
          name="breach_type"
          label={"Breach Type"}
          value={String(values.breach_type ?? '')}
          onChange={(v) => set('breach_type', v)}
          options={['Unauthorized Access', 'Data Loss', 'Improper Disclosure', 'Theft', 'Hacking', 'Other']}
          required={true}
          error={errors.breach_type}
          disabled={false}
        />
        <SelectField
          name="status"
          label={"Status"}
          value={String(values.status ?? '')}
          onChange={(v) => set('status', v)}
          options={['Reported', 'Under Investigation', 'Contained', 'Notified', 'Resolved', 'Closed']}
          required={true}
          error={errors.status}
          disabled={false}
        />
        <NumberField
          name="affected_patient_count"
          label={"Affected Patient Count"}
          value={typeof values.affected_patient_count === 'number' ? values.affected_patient_count : ''}
          onChange={(v) => set('affected_patient_count', v)}
          required={true}
          error={errors.affected_patient_count}
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
        <DateField
          name="discovered_at"
          label={"Discovered At"}
          value={toDateInputValue(values.discovered_at)}
          onChange={(v) => set('discovered_at', v)}
          required={true}
          error={errors.discovered_at}
          disabled={false}
        />
        <DateField
          name="reported_at"
          label={"Reported At"}
          value={toDateInputValue(values.reported_at)}
          onChange={(v) => set('reported_at', v)}
          required={true}
          error={errors.reported_at}
          disabled={false}
        />
        <DateField
          name="hhs_notification_deadline"
          label={"Hhs Notification Deadline"}
          value={toDateInputValue(values.hhs_notification_deadline)}
          onChange={(v) => set('hhs_notification_deadline', v)}
          required={true}
          error={errors.hhs_notification_deadline}
          disabled={false}
        />
        <DateField
          name="hhs_notified_at"
          label={"Hhs Notified At"}
          value={toDateInputValue(values.hhs_notified_at)}
          onChange={(v) => set('hhs_notified_at', v)}
          required={false}
          error={errors.hhs_notified_at}
          disabled={false}
        />
        <DateField
          name="patient_notification_sent_at"
          label={"Patient Notification Sent At"}
          value={toDateInputValue(values.patient_notification_sent_at)}
          onChange={(v) => set('patient_notification_sent_at', v)}
          required={false}
          error={errors.patient_notification_sent_at}
          disabled={false}
        />
        <TextField
          name="root_cause"
          label={"Root Cause"}
          value={String(values.root_cause ?? '')}
          onChange={(v) => set('root_cause', v)}
          required={false}
          error={errors.root_cause}
          disabled={false}
        />
        <TextField
          name="remediation_plan"
          label={"Remediation Plan"}
          value={String(values.remediation_plan ?? '')}
          onChange={(v) => set('remediation_plan', v)}
          required={false}
          error={errors.remediation_plan}
          disabled={false}
        />
        <FileUploadField
          name="supporting_document"
          label={"Supporting Document"}
          value={String(values.supporting_document ?? '')}
          fileLabel={values.supporting_document ? "Supporting Document" : undefined}
          accept={['.pdf', '.jpg', '.jpeg', '.png']}
          maxSizeMb={10}
          required={false}
          error={errors.supporting_document}
          disabled={false}
          downloadHref={values.supporting_document ? String(values.supporting_document) : undefined}
          onSelect={(file, dataUrl) => {
            const ext = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase() : '';
            if (!['.pdf', '.jpg', '.jpeg', '.png'].includes(ext)) {
              setErrors((prev) => ({ ...prev, supporting_document: `File type not allowed. Allowed: ${['.pdf', '.jpg', '.jpeg', '.png'].join(', ')}` }));
              return;
            }
            if (file.size > 10 * 1024 * 1024) {
              setErrors((prev) => ({ ...prev, supporting_document: 'File must be smaller than 10MB' }));
              return;
            }
            setErrors((prev) => {
              const next = { ...prev };
              delete next.supporting_document;
              return next;
            });
            set('supporting_document', dataUrl);
          }}
          onRemove={() => {
            set('supporting_document', '');
          }}
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
            {isEdit ? 'Save changes' : 'Create Breach Incident'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
