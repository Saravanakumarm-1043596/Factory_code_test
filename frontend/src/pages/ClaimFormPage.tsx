import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import type { Claim } from '../types/Claim';
import { claimService } from '../services/ClaimService';
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
import { labTestOrderService } from '../services/LabTestOrderService';
import { memberService } from '../services/MemberService';
import { providerService } from '../services/ProviderService';
import { lineOfBusinessService } from '../services/LineOfBusinessService';

type FormState = Record<string, unknown>;

function emptyForm(): FormState {
  return {
    claim_number: '',
    lab_test_order_id: '',
    member_id: '',
    rendering_provider_id: '',
    line_of_business_id: '',
    source_system: '',
    claim_type: '',
    claim_status: '',
    total_billed_amount: '',
    total_allowed_amount: '',
    total_paid_amount: '',
    member_responsibility: '',
    service_date: '',
    submitted_date: '',
    adjudicated_date: '',
    has_error: false,
    denial_reason_code: '',
    notes: '',
    created_at: '',
    updated_at: '',
  };
}

function omitKey<T extends Record<string, unknown>>(obj: T, key: string): Record<string, unknown> {
  const { [key]: _omitted, ...rest } = obj;
  return rest;
}

export function ClaimFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [values, setValues] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [lab_test_order_idOptions, setLab_test_order_idOptions] = useState<FKOption[]>([]);
  const [member_idOptions, setMember_idOptions] = useState<FKOption[]>([]);
  const [rendering_provider_idOptions, setRendering_provider_idOptions] = useState<FKOption[]>([]);
  const [line_of_business_idOptions, setLine_of_business_idOptions] = useState<FKOption[]>([]);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    claimService.list()
      .then((rows) => {
        const found = rows.find((r) => String(r.claim_id) === String(id));
        if (found) setValues({ ...found });
      })
      .catch(() => toast.error('Failed to load Claim'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  useEffect(() => {
    labTestOrderService.list()
      .then((rows) => setLab_test_order_idOptions(rows.map((r) => ({ value: String(r.lab_test_order_id), label: `${r.order_number}` }))))
      .catch(() => setLab_test_order_idOptions([]));
  }, []);

  useEffect(() => {
    memberService.list()
      .then((rows) => setMember_idOptions(rows.map((r) => ({ value: String(r.member_id), label: `${r.first_name}` }))))
      .catch(() => setMember_idOptions([]));
  }, []);

  useEffect(() => {
    providerService.list()
      .then((rows) => setRendering_provider_idOptions(rows.map((r) => ({ value: String(r.provider_id), label: `${r.provider_name}` }))))
      .catch(() => setRendering_provider_idOptions([]));
  }, []);

  useEffect(() => {
    lineOfBusinessService.list()
      .then((rows) => setLine_of_business_idOptions(rows.map((r) => ({ value: String(r.line_of_business_id), label: `#${r.line_of_business_id}` }))))
      .catch(() => setLine_of_business_idOptions([]));
  }, []);

  function set(name: string, value: unknown) {
    setValues((s) => ({ ...s, [name]: value }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!values.claim_number && values.claim_number !== 0 && values.claim_number !== false) nextErrors.claim_number = "Claim Number is required";
    if (!values.lab_test_order_id && values.lab_test_order_id !== 0 && values.lab_test_order_id !== false) nextErrors.lab_test_order_id = "Lab Test Order Id is required";
    if (!values.member_id && values.member_id !== 0 && values.member_id !== false) nextErrors.member_id = "Member Id is required";
    if (!values.rendering_provider_id && values.rendering_provider_id !== 0 && values.rendering_provider_id !== false) nextErrors.rendering_provider_id = "Rendering Provider Id is required";
    if (!values.line_of_business_id && values.line_of_business_id !== 0 && values.line_of_business_id !== false) nextErrors.line_of_business_id = "Line Of Business Id is required";
    if (!values.source_system && values.source_system !== 0 && values.source_system !== false) nextErrors.source_system = "Source System is required";
    if (!values.claim_type && values.claim_type !== 0 && values.claim_type !== false) nextErrors.claim_type = "Claim Type is required";
    if (!values.claim_status && values.claim_status !== 0 && values.claim_status !== false) nextErrors.claim_status = "Claim Status is required";
    if (!values.total_billed_amount && values.total_billed_amount !== 0 && values.total_billed_amount !== false) nextErrors.total_billed_amount = "Total Billed Amount is required";
    if (!values.service_date && values.service_date !== 0 && values.service_date !== false) nextErrors.service_date = "Service Date is required";
    if (!values.submitted_date && values.submitted_date !== 0 && values.submitted_date !== false) nextErrors.submitted_date = "Submitted Date is required";
    if (!values.has_error && values.has_error !== 0 && values.has_error !== false) nextErrors.has_error = "Has Error is required";
    if (!values.created_at && values.created_at !== 0 && values.created_at !== false) nextErrors.created_at = "Created At is required";
    if (!values.updated_at && values.updated_at !== 0 && values.updated_at !== false) nextErrors.updated_at = "Updated At is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = omitKey(values, 'claim_id');
      if (isEdit) {
        await claimService.update(id as never, payload as never);
        toast.success('Claim updated successfully');
        navigate(`/claims/${id}`);
      } else {
        const created = (await claimService.create(payload as never)) as Claim;
        toast.success('Claim created successfully');
        navigate(`/claims/${created.claim_id}`);
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
        to={isEdit ? `/claims/${id}` : '/claims'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isEdit ? 'Edit Claim' : 'New Claim'}</h1>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEdit && (
          <>
        <NumberField
          name="claim_id"
          label={"Claim Id"}
          value={typeof values.claim_id === 'number' ? values.claim_id : ''}
          onChange={(v) => set('claim_id', v)}
          required={false}
          error={errors.claim_id}
          disabled={true}
        />
          </>
        )}
        <TextField
          name="claim_number"
          label={"Claim Number"}
          value={String(values.claim_number ?? '')}
          onChange={(v) => set('claim_number', v)}
          required={true}
          error={errors.claim_number}
          disabled={false}
        />
        <FKSelectField
          name="lab_test_order_id"
          label={"Lab Test Order Id"}
          value={String(values.lab_test_order_id ?? '')}
          onChange={(v) => set('lab_test_order_id', v === '' ? '' : Number(v))}
          options={lab_test_order_idOptions}
          required={true}
          error={errors.lab_test_order_id}
          disabled={false}
        />
        <FKSelectField
          name="member_id"
          label={"Member Id"}
          value={String(values.member_id ?? '')}
          onChange={(v) => set('member_id', v === '' ? '' : Number(v))}
          options={member_idOptions}
          required={true}
          error={errors.member_id}
          disabled={false}
        />
        <FKSelectField
          name="rendering_provider_id"
          label={"Rendering Provider Id"}
          value={String(values.rendering_provider_id ?? '')}
          onChange={(v) => set('rendering_provider_id', v === '' ? '' : Number(v))}
          options={rendering_provider_idOptions}
          required={true}
          error={errors.rendering_provider_id}
          disabled={false}
        />
        <FKSelectField
          name="line_of_business_id"
          label={"Line Of Business Id"}
          value={String(values.line_of_business_id ?? '')}
          onChange={(v) => set('line_of_business_id', v === '' ? '' : Number(v))}
          options={line_of_business_idOptions}
          required={true}
          error={errors.line_of_business_id}
          disabled={false}
        />
        <SelectField
          name="source_system"
          label={"Source System"}
          value={String(values.source_system ?? '')}
          onChange={(v) => set('source_system', v)}
          options={['Facets', 'Epic', 'Manual']}
          required={true}
          error={errors.source_system}
          disabled={false}
        />
        <SelectField
          name="claim_type"
          label={"Claim Type"}
          value={String(values.claim_type ?? '')}
          onChange={(v) => set('claim_type', v)}
          options={['Professional', 'Institutional']}
          required={true}
          error={errors.claim_type}
          disabled={false}
        />
        <SelectField
          name="claim_status"
          label={"Claim Status"}
          value={String(values.claim_status ?? '')}
          onChange={(v) => set('claim_status', v)}
          options={['Submitted', 'Pending Review', 'Approved', 'Denied', 'Pended', 'Adjusted', 'Reprocessed']}
          required={true}
          error={errors.claim_status}
          disabled={false}
        />
        <NumberField
          name="total_billed_amount"
          label={"Total Billed Amount"}
          value={typeof values.total_billed_amount === 'number' ? values.total_billed_amount : ''}
          onChange={(v) => set('total_billed_amount', v)}
          required={true}
          error={errors.total_billed_amount}
          disabled={false}
        />
        <NumberField
          name="total_allowed_amount"
          label={"Total Allowed Amount"}
          value={typeof values.total_allowed_amount === 'number' ? values.total_allowed_amount : ''}
          onChange={(v) => set('total_allowed_amount', v)}
          required={false}
          error={errors.total_allowed_amount}
          disabled={false}
        />
        <NumberField
          name="total_paid_amount"
          label={"Total Paid Amount"}
          value={typeof values.total_paid_amount === 'number' ? values.total_paid_amount : ''}
          onChange={(v) => set('total_paid_amount', v)}
          required={false}
          error={errors.total_paid_amount}
          disabled={false}
        />
        <NumberField
          name="member_responsibility"
          label={"Member Responsibility"}
          value={typeof values.member_responsibility === 'number' ? values.member_responsibility : ''}
          onChange={(v) => set('member_responsibility', v)}
          required={false}
          error={errors.member_responsibility}
          disabled={false}
        />
        <DateField
          name="service_date"
          label={"Service Date"}
          value={toDateInputValue(values.service_date)}
          onChange={(v) => set('service_date', v)}
          required={true}
          error={errors.service_date}
          disabled={false}
        />
        <DateField
          name="submitted_date"
          label={"Submitted Date"}
          value={toDateInputValue(values.submitted_date)}
          onChange={(v) => set('submitted_date', v)}
          required={true}
          error={errors.submitted_date}
          disabled={false}
        />
        <DateField
          name="adjudicated_date"
          label={"Adjudicated Date"}
          value={toDateInputValue(values.adjudicated_date)}
          onChange={(v) => set('adjudicated_date', v)}
          required={false}
          error={errors.adjudicated_date}
          disabled={false}
        />
        <CheckboxField
          name="has_error"
          label={"Has Error"}
          value={Boolean(values.has_error)}
          onChange={(v) => set('has_error', v)}
          disabled={false}
        />
        <SelectField
          name="denial_reason_code"
          label={"Denial Reason Code"}
          value={String(values.denial_reason_code ?? '')}
          onChange={(v) => set('denial_reason_code', v)}
          options={['Duplicate Claim', 'Not Covered', 'Missing Information', 'Out of Network', 'Timely Filing']}
          required={false}
          error={errors.denial_reason_code}
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
            {isEdit ? 'Save changes' : 'Create Claim'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
