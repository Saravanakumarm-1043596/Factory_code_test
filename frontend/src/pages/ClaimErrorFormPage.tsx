import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import type { ClaimError } from '../types/ClaimError';
import { claimErrorService } from '../services/ClaimErrorService';
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
import { claimService } from '../services/ClaimService';
import { claimLineService } from '../services/ClaimLineService';

type FormState = Record<string, unknown>;

function emptyForm(): FormState {
  return {
    claim_id: '',
    claim_line_id: '',
    error_category: '',
    error_severity: '',
    error_description: '',
    source_system_origin: '',
    resolution_status: '',
    assigned_to: '',
    resolution_notes: '',
    detected_date: '',
    resolved_date: '',
    created_at: '',
  };
}

function omitKey<T extends Record<string, unknown>>(obj: T, key: string): Record<string, unknown> {
  const { [key]: _omitted, ...rest } = obj;
  return rest;
}

export function ClaimErrorFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [values, setValues] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [claim_idOptions, setClaim_idOptions] = useState<FKOption[]>([]);
  const [claim_line_idOptions, setClaim_line_idOptions] = useState<FKOption[]>([]);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    claimErrorService.list()
      .then((rows) => {
        const found = rows.find((r) => String(r.claim_error_id) === String(id));
        if (found) setValues({ ...found });
      })
      .catch(() => toast.error('Failed to load Claim Error'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  useEffect(() => {
    claimService.list()
      .then((rows) => setClaim_idOptions(rows.map((r) => ({ value: String(r.claim_id), label: `${r.claim_number}` }))))
      .catch(() => setClaim_idOptions([]));
  }, []);

  useEffect(() => {
    claimLineService.list()
      .then((rows) => setClaim_line_idOptions(rows.map((r) => ({ value: String(r.claim_line_id), label: `${r.cpt_code}` }))))
      .catch(() => setClaim_line_idOptions([]));
  }, []);

  function set(name: string, value: unknown) {
    setValues((s) => ({ ...s, [name]: value }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!values.claim_id && values.claim_id !== 0 && values.claim_id !== false) nextErrors.claim_id = "Claim Id is required";
    if (!values.error_category && values.error_category !== 0 && values.error_category !== false) nextErrors.error_category = "Error Category is required";
    if (!values.error_severity && values.error_severity !== 0 && values.error_severity !== false) nextErrors.error_severity = "Error Severity is required";
    if (!values.error_description && values.error_description !== 0 && values.error_description !== false) nextErrors.error_description = "Error Description is required";
    if (!values.source_system_origin && values.source_system_origin !== 0 && values.source_system_origin !== false) nextErrors.source_system_origin = "Source System Origin is required";
    if (!values.resolution_status && values.resolution_status !== 0 && values.resolution_status !== false) nextErrors.resolution_status = "Resolution Status is required";
    if (!values.detected_date && values.detected_date !== 0 && values.detected_date !== false) nextErrors.detected_date = "Detected Date is required";
    if (!values.created_at && values.created_at !== 0 && values.created_at !== false) nextErrors.created_at = "Created At is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = omitKey(values, 'claim_error_id');
      if (isEdit) {
        await claimErrorService.update(id as never, payload as never);
        toast.success('Claim Error updated successfully');
        navigate(`/claim-errors/${id}`);
      } else {
        const created = (await claimErrorService.create(payload as never)) as ClaimError;
        toast.success('Claim Error created successfully');
        navigate(`/claim-errors/${created.claim_error_id}`);
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
        to={isEdit ? `/claim-errors/${id}` : '/claim-errors'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isEdit ? 'Edit Claim Error' : 'New Claim Error'}</h1>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEdit && (
          <>
        <NumberField
          name="claim_error_id"
          label={"Claim Error Id"}
          value={typeof values.claim_error_id === 'number' ? values.claim_error_id : ''}
          onChange={(v) => set('claim_error_id', v)}
          required={false}
          error={errors.claim_error_id}
          disabled={true}
        />
          </>
        )}
        <FKSelectField
          name="claim_id"
          label={"Claim Id"}
          value={String(values.claim_id ?? '')}
          onChange={(v) => set('claim_id', v === '' ? '' : Number(v))}
          options={claim_idOptions}
          required={true}
          error={errors.claim_id}
          disabled={false}
        />
        <FKSelectField
          name="claim_line_id"
          label={"Claim Line Id"}
          value={String(values.claim_line_id ?? '')}
          onChange={(v) => set('claim_line_id', v === '' ? '' : Number(v))}
          options={claim_line_idOptions}
          required={false}
          error={errors.claim_line_id}
          disabled={false}
        />
        <SelectField
          name="error_category"
          label={"Error Category"}
          value={String(values.error_category ?? '')}
          onChange={(v) => set('error_category', v)}
          options={['Coding Error', 'Duplicate Claim', 'Authorization Missing', 'Member Eligibility', 'Provider Credentialing', 'Data Mismatch', 'Timely Filing', 'Other']}
          required={true}
          error={errors.error_category}
          disabled={false}
        />
        <SelectField
          name="error_severity"
          label={"Error Severity"}
          value={String(values.error_severity ?? '')}
          onChange={(v) => set('error_severity', v)}
          options={['Low', 'Medium', 'High', 'Critical']}
          required={true}
          error={errors.error_severity}
          disabled={false}
        />
        <TextAreaField
          name="error_description"
          label={"Error Description"}
          value={String(values.error_description ?? '')}
          onChange={(v) => set('error_description', v)}
          required={true}
          error={errors.error_description}
          disabled={false}
        />
        <SelectField
          name="source_system_origin"
          label={"Source System Origin"}
          value={String(values.source_system_origin ?? '')}
          onChange={(v) => set('source_system_origin', v)}
          options={['Facets', 'Epic', 'Cross-System']}
          required={true}
          error={errors.source_system_origin}
          disabled={false}
        />
        <SelectField
          name="resolution_status"
          label={"Resolution Status"}
          value={String(values.resolution_status ?? '')}
          onChange={(v) => set('resolution_status', v)}
          options={['Open', 'In Review', 'Resolved', 'Escalated', 'Waived']}
          required={true}
          error={errors.resolution_status}
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
          name="resolution_notes"
          label={"Resolution Notes"}
          value={String(values.resolution_notes ?? '')}
          onChange={(v) => set('resolution_notes', v)}
          required={false}
          error={errors.resolution_notes}
          disabled={false}
        />
        <DateField
          name="detected_date"
          label={"Detected Date"}
          value={toDateInputValue(values.detected_date)}
          onChange={(v) => set('detected_date', v)}
          required={true}
          error={errors.detected_date}
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
            {isEdit ? 'Save changes' : 'Create Claim Error'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
