import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import type { Patient } from '../types/Patient';
import { patientService } from '../services/PatientService';
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
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    email: '',
    phone_number: '',
    preferred_contact_method: '',
    preferred_language: '',
    membership_status: '',
    ehr_source_system: '',
    ehr_medical_record_number: '',
    no_show_risk_score: '',
    risk_score_updated_at: '',
    enrollment_date: '',
    consent_document: '',
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

export function PatientFormPage() {
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
    patientService.list()
      .then((rows) => {
        const found = rows.find((r) => String(r.patient_id) === String(id));
        if (found) setValues({ ...found });
      })
      .catch(() => toast.error('Failed to load Patient'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function set(name: string, value: unknown) {
    setValues((s) => ({ ...s, [name]: value }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!values.first_name && values.first_name !== 0 && values.first_name !== false) nextErrors.first_name = "First Name is required";
    if (!values.last_name && values.last_name !== 0 && values.last_name !== false) nextErrors.last_name = "Last Name is required";
    if (!values.date_of_birth && values.date_of_birth !== 0 && values.date_of_birth !== false) nextErrors.date_of_birth = "Date Of Birth is required";
    if (!values.gender && values.gender !== 0 && values.gender !== false) nextErrors.gender = "Gender is required";
    if (!values.phone_number && values.phone_number !== 0 && values.phone_number !== false) nextErrors.phone_number = "Phone Number is required";
    if (!values.preferred_contact_method && values.preferred_contact_method !== 0 && values.preferred_contact_method !== false) nextErrors.preferred_contact_method = "Preferred Contact Method is required";
    if (!values.preferred_language && values.preferred_language !== 0 && values.preferred_language !== false) nextErrors.preferred_language = "Preferred Language is required";
    if (!values.membership_status && values.membership_status !== 0 && values.membership_status !== false) nextErrors.membership_status = "Membership Status is required";
    if (!values.ehr_source_system && values.ehr_source_system !== 0 && values.ehr_source_system !== false) nextErrors.ehr_source_system = "Ehr Source System is required";
    if (!values.ehr_medical_record_number && values.ehr_medical_record_number !== 0 && values.ehr_medical_record_number !== false) nextErrors.ehr_medical_record_number = "Ehr Medical Record Number is required";
    if (!values.enrollment_date && values.enrollment_date !== 0 && values.enrollment_date !== false) nextErrors.enrollment_date = "Enrollment Date is required";
    if (!values.created_at && values.created_at !== 0 && values.created_at !== false) nextErrors.created_at = "Created At is required";
    if (!values.updated_at && values.updated_at !== 0 && values.updated_at !== false) nextErrors.updated_at = "Updated At is required";
    if (values.date_of_birth) {
      const date_of_birthDate = new Date(String(values.date_of_birth));
      const date_of_birthNow = new Date();
      if (date_of_birthDate.getTime() > date_of_birthNow.getTime()) {
        nextErrors.date_of_birth = "Date Of Birth cannot be in the future";
      } else {
        const date_of_birthAgeYears = (date_of_birthNow.getTime() - date_of_birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
        if (date_of_birthAgeYears < 0 || date_of_birthAgeYears > 130) {
          nextErrors.date_of_birth = "Date Of Birth must be a plausible date of birth";
        }
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = omitKey(values, 'patient_id');
      if (isEdit) {
        await patientService.uploadUpdate(id as never, toFormData(payload));
        toast.success('Patient updated successfully');
        navigate(`/patients/${id}`);
      } else {
        const created = (await patientService.uploadCreate(toFormData(payload))) as Patient;
        toast.success('Patient created successfully');
        navigate(`/patients/${created.patient_id}`);
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
        to={isEdit ? `/patients/${id}` : '/patients'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isEdit ? 'Edit Patient' : 'New Patient'}</h1>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEdit && (
          <>
        <TextField
          name="patient_id"
          label={"Patient Id"}
          value={String(values.patient_id ?? '')}
          onChange={(v) => set('patient_id', v)}
          required={false}
          error={errors.patient_id}
          disabled={true}
        />
          </>
        )}
        <TextField
          name="first_name"
          label={"First Name"}
          value={String(values.first_name ?? '')}
          onChange={(v) => set('first_name', v)}
          required={true}
          error={errors.first_name}
          disabled={false}
        />
        <TextField
          name="last_name"
          label={"Last Name"}
          value={String(values.last_name ?? '')}
          onChange={(v) => set('last_name', v)}
          required={true}
          error={errors.last_name}
          disabled={false}
        />
        <DateField
          name="date_of_birth"
          label={"Date Of Birth"}
          value={toDateInputValue(values.date_of_birth)}
          onChange={(v) => set('date_of_birth', v)}
          required={true}
          error={errors.date_of_birth}
          disabled={false}
        />
        <SelectField
          name="gender"
          label={"Gender"}
          value={String(values.gender ?? '')}
          onChange={(v) => set('gender', v)}
          options={['Male', 'Female', 'Non-Binary', 'Other', 'Prefer Not to Say']}
          required={true}
          error={errors.gender}
          disabled={false}
        />
        <TextField
          name="email"
          label={"Email"}
          value={String(values.email ?? '')}
          onChange={(v) => set('email', v)}
          required={false}
          error={errors.email}
          disabled={false}
        />
        <TextField
          name="phone_number"
          label={"Phone Number"}
          value={String(values.phone_number ?? '')}
          onChange={(v) => set('phone_number', v)}
          required={true}
          error={errors.phone_number}
          disabled={false}
        />
        <SelectField
          name="preferred_contact_method"
          label={"Preferred Contact Method"}
          value={String(values.preferred_contact_method ?? '')}
          onChange={(v) => set('preferred_contact_method', v)}
          options={['Phone', 'Email', 'SMS', 'Patient Portal']}
          required={true}
          error={errors.preferred_contact_method}
          disabled={false}
        />
        <SelectField
          name="preferred_language"
          label={"Preferred Language"}
          value={String(values.preferred_language ?? '')}
          onChange={(v) => set('preferred_language', v)}
          options={['English', 'Spanish', 'Mandarin', 'Other']}
          required={true}
          error={errors.preferred_language}
          disabled={false}
        />
        <SelectField
          name="membership_status"
          label={"Membership Status"}
          value={String(values.membership_status ?? '')}
          onChange={(v) => set('membership_status', v)}
          options={['Active', 'Inactive', 'Suspended', 'Terminated']}
          required={true}
          error={errors.membership_status}
          disabled={false}
        />
        <SelectField
          name="ehr_source_system"
          label={"Ehr Source System"}
          value={String(values.ehr_source_system ?? '')}
          onChange={(v) => set('ehr_source_system', v)}
          options={['Epic', 'Cerner']}
          required={true}
          error={errors.ehr_source_system}
          disabled={false}
        />
        <TextField
          name="ehr_medical_record_number"
          label={"Ehr Medical Record Number"}
          value={String(values.ehr_medical_record_number ?? '')}
          onChange={(v) => set('ehr_medical_record_number', v)}
          required={true}
          error={errors.ehr_medical_record_number}
          disabled={false}
        />
        <NumberField
          name="no_show_risk_score"
          label={"No Show Risk Score"}
          value={typeof values.no_show_risk_score === 'number' ? values.no_show_risk_score : ''}
          onChange={(v) => set('no_show_risk_score', v)}
          required={false}
          error={errors.no_show_risk_score}
          disabled={false}
        />
        <DateField
          name="risk_score_updated_at"
          label={"Risk Score Updated At"}
          value={toDateInputValue(values.risk_score_updated_at)}
          onChange={(v) => set('risk_score_updated_at', v)}
          required={false}
          error={errors.risk_score_updated_at}
          disabled={false}
        />
        <DateField
          name="enrollment_date"
          label={"Enrollment Date"}
          value={toDateInputValue(values.enrollment_date)}
          onChange={(v) => set('enrollment_date', v)}
          required={true}
          error={errors.enrollment_date}
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
            {isEdit ? 'Save changes' : 'Create Patient'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
