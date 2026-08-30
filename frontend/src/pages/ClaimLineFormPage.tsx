import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import type { ClaimLine } from '../types/ClaimLine';
import { claimLineService } from '../services/ClaimLineService';
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
import { labTestLineService } from '../services/LabTestLineService';

type FormState = Record<string, unknown>;

function emptyForm(): FormState {
  return {
    claim_id: '',
    line_number: '',
    cpt_code: '',
    modifier: '',
    icd10_pointer: '',
    units: '',
    billed_amount: '',
    allowed_amount: '',
    paid_amount: '',
    line_status: '',
    denial_reason_code: '',
    lab_test_line_id: '',
    created_at: '',
  };
}

function omitKey<T extends Record<string, unknown>>(obj: T, key: string): Record<string, unknown> {
  const { [key]: _omitted, ...rest } = obj;
  return rest;
}

export function ClaimLineFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [values, setValues] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [claim_idOptions, setClaim_idOptions] = useState<FKOption[]>([]);
  const [lab_test_line_idOptions, setLab_test_line_idOptions] = useState<FKOption[]>([]);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    claimLineService.list()
      .then((rows) => {
        const found = rows.find((r) => String(r.claim_line_id) === String(id));
        if (found) setValues({ ...found });
      })
      .catch(() => toast.error('Failed to load Claim Line'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  useEffect(() => {
    claimService.list()
      .then((rows) => setClaim_idOptions(rows.map((r) => ({ value: String(r.claim_id), label: `${r.claim_number}` }))))
      .catch(() => setClaim_idOptions([]));
  }, []);

  useEffect(() => {
    labTestLineService.list()
      .then((rows) => setLab_test_line_idOptions(rows.map((r) => ({ value: String(r.lab_test_line_id), label: `${r.test_name}` }))))
      .catch(() => setLab_test_line_idOptions([]));
  }, []);

  function set(name: string, value: unknown) {
    setValues((s) => ({ ...s, [name]: value }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!values.claim_id && values.claim_id !== 0 && values.claim_id !== false) nextErrors.claim_id = "Claim Id is required";
    if (!values.line_number && values.line_number !== 0 && values.line_number !== false) nextErrors.line_number = "Line Number is required";
    if (!values.cpt_code && values.cpt_code !== 0 && values.cpt_code !== false) nextErrors.cpt_code = "Cpt Code is required";
    if (!values.units && values.units !== 0 && values.units !== false) nextErrors.units = "Units is required";
    if (!values.billed_amount && values.billed_amount !== 0 && values.billed_amount !== false) nextErrors.billed_amount = "Billed Amount is required";
    if (!values.line_status && values.line_status !== 0 && values.line_status !== false) nextErrors.line_status = "Line Status is required";
    if (!values.created_at && values.created_at !== 0 && values.created_at !== false) nextErrors.created_at = "Created At is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = omitKey(values, 'claim_line_id');
      if (isEdit) {
        await claimLineService.update(id as never, payload as never);
        toast.success('Claim Line updated successfully');
        navigate(`/claim-lines/${id}`);
      } else {
        const created = (await claimLineService.create(payload as never)) as ClaimLine;
        toast.success('Claim Line created successfully');
        navigate(`/claim-lines/${created.claim_line_id}`);
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
        to={isEdit ? `/claim-lines/${id}` : '/claim-lines'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isEdit ? 'Edit Claim Line' : 'New Claim Line'}</h1>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEdit && (
          <>
        <NumberField
          name="claim_line_id"
          label={"Claim Line Id"}
          value={typeof values.claim_line_id === 'number' ? values.claim_line_id : ''}
          onChange={(v) => set('claim_line_id', v)}
          required={false}
          error={errors.claim_line_id}
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
        <NumberField
          name="line_number"
          label={"Line Number"}
          value={typeof values.line_number === 'number' ? values.line_number : ''}
          onChange={(v) => set('line_number', v)}
          required={true}
          error={errors.line_number}
          disabled={false}
        />
        <TextField
          name="cpt_code"
          label={"Cpt Code"}
          value={String(values.cpt_code ?? '')}
          onChange={(v) => set('cpt_code', v)}
          required={true}
          error={errors.cpt_code}
          disabled={false}
        />
        <TextField
          name="modifier"
          label={"Modifier"}
          value={String(values.modifier ?? '')}
          onChange={(v) => set('modifier', v)}
          required={false}
          error={errors.modifier}
          disabled={false}
        />
        <TextField
          name="icd10_pointer"
          label={"Icd10 Pointer"}
          value={String(values.icd10_pointer ?? '')}
          onChange={(v) => set('icd10_pointer', v)}
          required={false}
          error={errors.icd10_pointer}
          disabled={false}
        />
        <NumberField
          name="units"
          label={"Units"}
          value={typeof values.units === 'number' ? values.units : ''}
          onChange={(v) => set('units', v)}
          required={true}
          error={errors.units}
          disabled={false}
        />
        <NumberField
          name="billed_amount"
          label={"Billed Amount"}
          value={typeof values.billed_amount === 'number' ? values.billed_amount : ''}
          onChange={(v) => set('billed_amount', v)}
          required={true}
          error={errors.billed_amount}
          disabled={false}
        />
        <NumberField
          name="allowed_amount"
          label={"Allowed Amount"}
          value={typeof values.allowed_amount === 'number' ? values.allowed_amount : ''}
          onChange={(v) => set('allowed_amount', v)}
          required={false}
          error={errors.allowed_amount}
          disabled={false}
        />
        <NumberField
          name="paid_amount"
          label={"Paid Amount"}
          value={typeof values.paid_amount === 'number' ? values.paid_amount : ''}
          onChange={(v) => set('paid_amount', v)}
          required={false}
          error={errors.paid_amount}
          disabled={false}
        />
        <SelectField
          name="line_status"
          label={"Line Status"}
          value={String(values.line_status ?? '')}
          onChange={(v) => set('line_status', v)}
          options={['Approved', 'Denied', 'Pended', 'Adjusted']}
          required={true}
          error={errors.line_status}
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
        <FKSelectField
          name="lab_test_line_id"
          label={"Lab Test Line Id"}
          value={String(values.lab_test_line_id ?? '')}
          onChange={(v) => set('lab_test_line_id', v === '' ? '' : Number(v))}
          options={lab_test_line_idOptions}
          required={false}
          error={errors.lab_test_line_id}
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
            {isEdit ? 'Save changes' : 'Create Claim Line'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
