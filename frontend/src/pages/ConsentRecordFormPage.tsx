import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import type { ConsentRecord } from '../types/ConsentRecord';
import { consentRecordService } from '../services/ConsentRecordService';
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
import { patientService } from '../services/PatientService';
import { appUserService } from '../services/AppUserService';
import { FileUploadField } from '../components/ui/FileUploadField';

type FormState = Record<string, unknown>;

function emptyForm(): FormState {
  return {
    patient_id: '',
    consent_type: '',
    status: '',
    granted_at: '',
    expires_at: '',
    revoked_at: '',
    collected_by_user_id: '',
    consent_document: '',
    notes: '',
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

export function ConsentRecordFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [values, setValues] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [patient_idOptions, setPatient_idOptions] = useState<FKOption[]>([]);
  const [collected_by_user_idOptions, setCollected_by_user_idOptions] = useState<FKOption[]>([]);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    consentRecordService.list()
      .then((rows) => {
        const found = rows.find((r) => String(r.consent_record_id) === String(id));
        if (found) setValues({ ...found });
      })
      .catch(() => toast.error('Failed to load Consent Record'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  useEffect(() => {
    patientService.list()
      .then((rows) => setPatient_idOptions(rows.map((r) => ({ value: String(r.patient_id), label: `${r.first_name}` }))))
      .catch(() => setPatient_idOptions([]));
  }, []);

  useEffect(() => {
    appUserService.list()
      .then((rows) => setCollected_by_user_idOptions(rows.map((r) => ({ value: String(r.app_user_id), label: `${r.first_name}` }))))
      .catch(() => setCollected_by_user_idOptions([]));
  }, []);

  function set(name: string, value: unknown) {
    setValues((s) => ({ ...s, [name]: value }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!values.patient_id && values.patient_id !== 0 && values.patient_id !== false) nextErrors.patient_id = "Patient Id is required";
    if (!values.consent_type && values.consent_type !== 0 && values.consent_type !== false) nextErrors.consent_type = "Consent Type is required";
    if (!values.status && values.status !== 0 && values.status !== false) nextErrors.status = "Status is required";
    if (!values.granted_at && values.granted_at !== 0 && values.granted_at !== false) nextErrors.granted_at = "Granted At is required";
    if (!values.collected_by_user_id && values.collected_by_user_id !== 0 && values.collected_by_user_id !== false) nextErrors.collected_by_user_id = "Collected By User Id is required";
    if (!values.created_at && values.created_at !== 0 && values.created_at !== false) nextErrors.created_at = "Created At is required";
    if (!values.updated_at && values.updated_at !== 0 && values.updated_at !== false) nextErrors.updated_at = "Updated At is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = omitKey(values, 'consent_record_id');
      if (isEdit) {
        await consentRecordService.uploadUpdate(id as never, toFormData(payload));
        toast.success('Consent Record updated successfully');
        navigate(`/consent-records/${id}`);
      } else {
        const created = (await consentRecordService.uploadCreate(toFormData(payload))) as ConsentRecord;
        toast.success('Consent Record created successfully');
        navigate(`/consent-records/${created.consent_record_id}`);
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
        to={isEdit ? `/consent-records/${id}` : '/consent-records'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isEdit ? 'Edit Consent Record' : 'New Consent Record'}</h1>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEdit && (
          <>
        <TextField
          name="consent_record_id"
          label={"Consent Record Id"}
          value={String(values.consent_record_id ?? '')}
          onChange={(v) => set('consent_record_id', v)}
          required={false}
          error={errors.consent_record_id}
          disabled={true}
        />
          </>
        )}
        <FKSelectField
          name="patient_id"
          label={"Patient Id"}
          value={String(values.patient_id ?? '')}
          onChange={(v) => set('patient_id', v)}
          options={patient_idOptions}
          required={true}
          error={errors.patient_id}
          disabled={false}
        />
        <SelectField
          name="consent_type"
          label={"Consent Type"}
          value={String(values.consent_type ?? '')}
          onChange={(v) => set('consent_type', v)}
          options={['General Treatment', 'SMS Communication', 'Email Communication', 'Data Sharing', 'Research', 'Telehealth']}
          required={true}
          error={errors.consent_type}
          disabled={false}
        />
        <SelectField
          name="status"
          label={"Status"}
          value={String(values.status ?? '')}
          onChange={(v) => set('status', v)}
          options={['Active', 'Revoked', 'Expired']}
          required={true}
          error={errors.status}
          disabled={false}
        />
        <DateField
          name="granted_at"
          label={"Granted At"}
          value={toDateInputValue(values.granted_at)}
          onChange={(v) => set('granted_at', v)}
          required={true}
          error={errors.granted_at}
          disabled={false}
        />
        <DateField
          name="expires_at"
          label={"Expires At"}
          value={toDateInputValue(values.expires_at)}
          onChange={(v) => set('expires_at', v)}
          required={false}
          error={errors.expires_at}
          disabled={false}
        />
        <DateField
          name="revoked_at"
          label={"Revoked At"}
          value={toDateInputValue(values.revoked_at)}
          onChange={(v) => set('revoked_at', v)}
          required={false}
          error={errors.revoked_at}
          disabled={false}
        />
        <FKSelectField
          name="collected_by_user_id"
          label={"Collected By User Id"}
          value={String(values.collected_by_user_id ?? '')}
          onChange={(v) => set('collected_by_user_id', v)}
          options={collected_by_user_idOptions}
          required={true}
          error={errors.collected_by_user_id}
          disabled={false}
        />
        <FileUploadField
          name="consent_document"
          label={"Consent Document"}
          value={String(values.consent_document ?? '')}
          fileLabel={values.consent_document ? "Consent Document" : undefined}
          accept={['.pdf', '.jpg', '.jpeg', '.png']}
          maxSizeMb={10}
          required={false}
          error={errors.consent_document}
          disabled={false}
          downloadHref={values.consent_document ? String(values.consent_document) : undefined}
          onSelect={(file, dataUrl) => {
            const ext = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase() : '';
            if (!['.pdf', '.jpg', '.jpeg', '.png'].includes(ext)) {
              setErrors((prev) => ({ ...prev, consent_document: `File type not allowed. Allowed: ${['.pdf', '.jpg', '.jpeg', '.png'].join(', ')}` }));
              return;
            }
            if (file.size > 10 * 1024 * 1024) {
              setErrors((prev) => ({ ...prev, consent_document: 'File must be smaller than 10MB' }));
              return;
            }
            setErrors((prev) => {
              const next = { ...prev };
              delete next.consent_document;
              return next;
            });
            set('consent_document', dataUrl);
          }}
          onRemove={() => {
            set('consent_document', '');
          }}
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
            {isEdit ? 'Save changes' : 'Create Consent Record'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
