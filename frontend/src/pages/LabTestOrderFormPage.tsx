import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import type { LabTestOrder } from '../types/LabTestOrder';
import { labTestOrderService } from '../services/LabTestOrderService';
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
import { memberService } from '../services/MemberService';
import { providerService } from '../services/ProviderService';
import { lineOfBusinessService } from '../services/LineOfBusinessService';

type FormState = Record<string, unknown>;

function emptyForm(): FormState {
  return {
    order_number: '',
    member_id: '',
    ordering_provider_id: '',
    performing_lab_id: '',
    line_of_business_id: '',
    source_system: '',
    order_status: '',
    priority: '',
    clinical_indication: '',
    icd10_codes: '',
    order_date: '',
    specimen_collection_date: '',
    result_date: '',
    prior_auth_required: false,
    prior_auth_number: '',
    notes: '',
    created_at: '',
    updated_at: '',
  };
}

function omitKey<T extends Record<string, unknown>>(obj: T, key: string): Record<string, unknown> {
  const { [key]: _omitted, ...rest } = obj;
  return rest;
}

export function LabTestOrderFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [values, setValues] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [member_idOptions, setMember_idOptions] = useState<FKOption[]>([]);
  const [ordering_provider_idOptions, setOrdering_provider_idOptions] = useState<FKOption[]>([]);
  const [performing_lab_idOptions, setPerforming_lab_idOptions] = useState<FKOption[]>([]);
  const [line_of_business_idOptions, setLine_of_business_idOptions] = useState<FKOption[]>([]);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    labTestOrderService.list()
      .then((rows) => {
        const found = rows.find((r) => String(r.lab_test_order_id) === String(id));
        if (found) setValues({ ...found });
      })
      .catch(() => toast.error('Failed to load Lab Test Order'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  useEffect(() => {
    memberService.list()
      .then((rows) => setMember_idOptions(rows.map((r) => ({ value: String(r.member_id), label: `${r.first_name}` }))))
      .catch(() => setMember_idOptions([]));
  }, []);

  useEffect(() => {
    providerService.list()
      .then((rows) => setOrdering_provider_idOptions(rows.map((r) => ({ value: String(r.provider_id), label: `${r.provider_name}` }))))
      .catch(() => setOrdering_provider_idOptions([]));
  }, []);

  useEffect(() => {
    providerService.list()
      .then((rows) => setPerforming_lab_idOptions(rows.map((r) => ({ value: String(r.provider_id), label: `${r.provider_name}` }))))
      .catch(() => setPerforming_lab_idOptions([]));
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
    if (!values.order_number && values.order_number !== 0 && values.order_number !== false) nextErrors.order_number = "Order Number is required";
    if (!values.member_id && values.member_id !== 0 && values.member_id !== false) nextErrors.member_id = "Member Id is required";
    if (!values.ordering_provider_id && values.ordering_provider_id !== 0 && values.ordering_provider_id !== false) nextErrors.ordering_provider_id = "Ordering Provider Id is required";
    if (!values.performing_lab_id && values.performing_lab_id !== 0 && values.performing_lab_id !== false) nextErrors.performing_lab_id = "Performing Lab Id is required";
    if (!values.line_of_business_id && values.line_of_business_id !== 0 && values.line_of_business_id !== false) nextErrors.line_of_business_id = "Line Of Business Id is required";
    if (!values.source_system && values.source_system !== 0 && values.source_system !== false) nextErrors.source_system = "Source System is required";
    if (!values.order_status && values.order_status !== 0 && values.order_status !== false) nextErrors.order_status = "Order Status is required";
    if (!values.priority && values.priority !== 0 && values.priority !== false) nextErrors.priority = "Priority is required";
    if (!values.order_date && values.order_date !== 0 && values.order_date !== false) nextErrors.order_date = "Order Date is required";
    if (!values.prior_auth_required && values.prior_auth_required !== 0 && values.prior_auth_required !== false) nextErrors.prior_auth_required = "Prior Auth Required is required";
    if (!values.created_at && values.created_at !== 0 && values.created_at !== false) nextErrors.created_at = "Created At is required";
    if (!values.updated_at && values.updated_at !== 0 && values.updated_at !== false) nextErrors.updated_at = "Updated At is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = omitKey(values, 'lab_test_order_id');
      if (isEdit) {
        await labTestOrderService.update(id as never, payload as never);
        toast.success('Lab Test Order updated successfully');
        navigate(`/lab-test-orders/${id}`);
      } else {
        const created = (await labTestOrderService.create(payload as never)) as LabTestOrder;
        toast.success('Lab Test Order created successfully');
        navigate(`/lab-test-orders/${created.lab_test_order_id}`);
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
        to={isEdit ? `/lab-test-orders/${id}` : '/lab-test-orders'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isEdit ? 'Edit Lab Test Order' : 'New Lab Test Order'}</h1>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEdit && (
          <>
        <NumberField
          name="lab_test_order_id"
          label={"Lab Test Order Id"}
          value={typeof values.lab_test_order_id === 'number' ? values.lab_test_order_id : ''}
          onChange={(v) => set('lab_test_order_id', v)}
          required={false}
          error={errors.lab_test_order_id}
          disabled={true}
        />
          </>
        )}
        <TextField
          name="order_number"
          label={"Order Number"}
          value={String(values.order_number ?? '')}
          onChange={(v) => set('order_number', v)}
          required={true}
          error={errors.order_number}
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
          name="ordering_provider_id"
          label={"Ordering Provider Id"}
          value={String(values.ordering_provider_id ?? '')}
          onChange={(v) => set('ordering_provider_id', v === '' ? '' : Number(v))}
          options={ordering_provider_idOptions}
          required={true}
          error={errors.ordering_provider_id}
          disabled={false}
        />
        <FKSelectField
          name="performing_lab_id"
          label={"Performing Lab Id"}
          value={String(values.performing_lab_id ?? '')}
          onChange={(v) => set('performing_lab_id', v === '' ? '' : Number(v))}
          options={performing_lab_idOptions}
          required={true}
          error={errors.performing_lab_id}
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
          options={['Facets', 'Epic', 'Manual Entry']}
          required={true}
          error={errors.source_system}
          disabled={false}
        />
        <SelectField
          name="order_status"
          label={"Order Status"}
          value={String(values.order_status ?? '')}
          onChange={(v) => set('order_status', v)}
          options={['Ordered', 'Specimen Collected', 'In Progress', 'Resulted', 'Cancelled', 'On Hold']}
          required={true}
          error={errors.order_status}
          disabled={false}
        />
        <SelectField
          name="priority"
          label={"Priority"}
          value={String(values.priority ?? '')}
          onChange={(v) => set('priority', v)}
          options={['Routine', 'Urgent', 'STAT']}
          required={true}
          error={errors.priority}
          disabled={false}
        />
        <TextField
          name="clinical_indication"
          label={"Clinical Indication"}
          value={String(values.clinical_indication ?? '')}
          onChange={(v) => set('clinical_indication', v)}
          required={false}
          error={errors.clinical_indication}
          disabled={false}
        />
        <TextField
          name="icd10_codes"
          label={"Icd10 Codes"}
          value={String(values.icd10_codes ?? '')}
          onChange={(v) => set('icd10_codes', v)}
          required={false}
          error={errors.icd10_codes}
          disabled={false}
        />
        <DateField
          name="order_date"
          label={"Order Date"}
          value={toDateInputValue(values.order_date)}
          onChange={(v) => set('order_date', v)}
          required={true}
          error={errors.order_date}
          disabled={false}
        />
        <DateField
          name="specimen_collection_date"
          label={"Specimen Collection Date"}
          value={toDateInputValue(values.specimen_collection_date)}
          onChange={(v) => set('specimen_collection_date', v)}
          required={false}
          error={errors.specimen_collection_date}
          disabled={false}
        />
        <DateField
          name="result_date"
          label={"Result Date"}
          value={toDateInputValue(values.result_date)}
          onChange={(v) => set('result_date', v)}
          required={false}
          error={errors.result_date}
          disabled={false}
        />
        <CheckboxField
          name="prior_auth_required"
          label={"Prior Auth Required"}
          value={Boolean(values.prior_auth_required)}
          onChange={(v) => set('prior_auth_required', v)}
          disabled={false}
        />
        <SelectField
          name="prior_auth_number"
          label={"Prior Auth Number"}
          value={String(values.prior_auth_number ?? '')}
          onChange={(v) => set('prior_auth_number', v)}
          options={['Requested', 'Pending Review', 'Approved', 'Partially Approved', 'Denied']}
          required={false}
          error={errors.prior_auth_number}
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
            {isEdit ? 'Save changes' : 'Create Lab Test Order'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
