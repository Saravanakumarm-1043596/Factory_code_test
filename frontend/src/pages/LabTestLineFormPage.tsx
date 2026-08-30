import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import type { LabTestLine } from '../types/LabTestLine';
import { labTestLineService } from '../services/LabTestLineService';
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

type FormState = Record<string, unknown>;

function emptyForm(): FormState {
  return {
    lab_test_order_id: '',
    cpt_code: '',
    test_name: '',
    loinc_code: '',
    test_category: '',
    result_value: '',
    result_unit: '',
    reference_range: '',
    abnormal_flag: '',
    line_status: '',
    result_date: '',
    created_at: '',
  };
}

function omitKey<T extends Record<string, unknown>>(obj: T, key: string): Record<string, unknown> {
  const { [key]: _omitted, ...rest } = obj;
  return rest;
}

export function LabTestLineFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [values, setValues] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [lab_test_order_idOptions, setLab_test_order_idOptions] = useState<FKOption[]>([]);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    labTestLineService.list()
      .then((rows) => {
        const found = rows.find((r) => String(r.lab_test_line_id) === String(id));
        if (found) setValues({ ...found });
      })
      .catch(() => toast.error('Failed to load Lab Test Line'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  useEffect(() => {
    labTestOrderService.list()
      .then((rows) => setLab_test_order_idOptions(rows.map((r) => ({ value: String(r.lab_test_order_id), label: `${r.order_number}` }))))
      .catch(() => setLab_test_order_idOptions([]));
  }, []);

  function set(name: string, value: unknown) {
    setValues((s) => ({ ...s, [name]: value }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!values.lab_test_order_id && values.lab_test_order_id !== 0 && values.lab_test_order_id !== false) nextErrors.lab_test_order_id = "Lab Test Order Id is required";
    if (!values.cpt_code && values.cpt_code !== 0 && values.cpt_code !== false) nextErrors.cpt_code = "Cpt Code is required";
    if (!values.test_name && values.test_name !== 0 && values.test_name !== false) nextErrors.test_name = "Test Name is required";
    if (!values.test_category && values.test_category !== 0 && values.test_category !== false) nextErrors.test_category = "Test Category is required";
    if (!values.line_status && values.line_status !== 0 && values.line_status !== false) nextErrors.line_status = "Line Status is required";
    if (!values.created_at && values.created_at !== 0 && values.created_at !== false) nextErrors.created_at = "Created At is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = omitKey(values, 'lab_test_line_id');
      if (isEdit) {
        await labTestLineService.update(id as never, payload as never);
        toast.success('Lab Test Line updated successfully');
        navigate(`/lab-test-lines/${id}`);
      } else {
        const created = (await labTestLineService.create(payload as never)) as LabTestLine;
        toast.success('Lab Test Line created successfully');
        navigate(`/lab-test-lines/${created.lab_test_line_id}`);
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
        to={isEdit ? `/lab-test-lines/${id}` : '/lab-test-lines'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isEdit ? 'Edit Lab Test Line' : 'New Lab Test Line'}</h1>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEdit && (
          <>
        <NumberField
          name="lab_test_line_id"
          label={"Lab Test Line Id"}
          value={typeof values.lab_test_line_id === 'number' ? values.lab_test_line_id : ''}
          onChange={(v) => set('lab_test_line_id', v)}
          required={false}
          error={errors.lab_test_line_id}
          disabled={true}
        />
          </>
        )}
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
          name="test_name"
          label={"Test Name"}
          value={String(values.test_name ?? '')}
          onChange={(v) => set('test_name', v)}
          required={true}
          error={errors.test_name}
          disabled={false}
        />
        <TextField
          name="loinc_code"
          label={"Loinc Code"}
          value={String(values.loinc_code ?? '')}
          onChange={(v) => set('loinc_code', v)}
          required={false}
          error={errors.loinc_code}
          disabled={false}
        />
        <SelectField
          name="test_category"
          label={"Test Category"}
          value={String(values.test_category ?? '')}
          onChange={(v) => set('test_category', v)}
          options={['Chemistry', 'Hematology', 'Microbiology', 'Pathology', 'Genetic', 'Immunology', 'Toxicology', 'Other']}
          required={true}
          error={errors.test_category}
          disabled={false}
        />
        <TextField
          name="result_value"
          label={"Result Value"}
          value={String(values.result_value ?? '')}
          onChange={(v) => set('result_value', v)}
          required={false}
          error={errors.result_value}
          disabled={false}
        />
        <TextField
          name="result_unit"
          label={"Result Unit"}
          value={String(values.result_unit ?? '')}
          onChange={(v) => set('result_unit', v)}
          required={false}
          error={errors.result_unit}
          disabled={false}
        />
        <TextField
          name="reference_range"
          label={"Reference Range"}
          value={String(values.reference_range ?? '')}
          onChange={(v) => set('reference_range', v)}
          required={false}
          error={errors.reference_range}
          disabled={false}
        />
        <SelectField
          name="abnormal_flag"
          label={"Abnormal Flag"}
          value={String(values.abnormal_flag ?? '')}
          onChange={(v) => set('abnormal_flag', v)}
          options={['Normal', 'Low', 'High', 'Critical Low', 'Critical High', 'Abnormal']}
          required={false}
          error={errors.abnormal_flag}
          disabled={false}
        />
        <SelectField
          name="line_status"
          label={"Line Status"}
          value={String(values.line_status ?? '')}
          onChange={(v) => set('line_status', v)}
          options={['Pending', 'Resulted', 'Cancelled']}
          required={true}
          error={errors.line_status}
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
            {isEdit ? 'Save changes' : 'Create Lab Test Line'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
