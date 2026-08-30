import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import type { Member } from '../types/Member';
import { memberService } from '../services/MemberService';
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
import { lineOfBusinessService } from '../services/LineOfBusinessService';

type FormState = Record<string, unknown>;

function emptyForm(): FormState {
  return {
    facets_member_id: '',
    epic_mrn: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    email: '',
    phone: '',
    line_of_business_id: '',
    plan_type: '',
    coverage_start_date: '',
    coverage_end_date: '',
    member_status: '',
    created_at: '',
  };
}

function omitKey<T extends Record<string, unknown>>(obj: T, key: string): Record<string, unknown> {
  const { [key]: _omitted, ...rest } = obj;
  return rest;
}

export function MemberFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [values, setValues] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [line_of_business_idOptions, setLine_of_business_idOptions] = useState<FKOption[]>([]);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    memberService.list()
      .then((rows) => {
        const found = rows.find((r) => String(r.member_id) === String(id));
        if (found) setValues({ ...found });
      })
      .catch(() => toast.error('Failed to load Member'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

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
    if (!values.facets_member_id && values.facets_member_id !== 0 && values.facets_member_id !== false) nextErrors.facets_member_id = "Facets Member Id is required";
    if (!values.first_name && values.first_name !== 0 && values.first_name !== false) nextErrors.first_name = "First Name is required";
    if (!values.last_name && values.last_name !== 0 && values.last_name !== false) nextErrors.last_name = "Last Name is required";
    if (!values.date_of_birth && values.date_of_birth !== 0 && values.date_of_birth !== false) nextErrors.date_of_birth = "Date Of Birth is required";
    if (!values.gender && values.gender !== 0 && values.gender !== false) nextErrors.gender = "Gender is required";
    if (!values.line_of_business_id && values.line_of_business_id !== 0 && values.line_of_business_id !== false) nextErrors.line_of_business_id = "Line Of Business Id is required";
    if (!values.plan_type && values.plan_type !== 0 && values.plan_type !== false) nextErrors.plan_type = "Plan Type is required";
    if (!values.coverage_start_date && values.coverage_start_date !== 0 && values.coverage_start_date !== false) nextErrors.coverage_start_date = "Coverage Start Date is required";
    if (!values.member_status && values.member_status !== 0 && values.member_status !== false) nextErrors.member_status = "Member Status is required";
    if (!values.created_at && values.created_at !== 0 && values.created_at !== false) nextErrors.created_at = "Created At is required";
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
      const payload = omitKey(values, 'member_id');
      if (isEdit) {
        await memberService.update(id as never, payload as never);
        toast.success('Member updated successfully');
        navigate(`/members/${id}`);
      } else {
        const created = (await memberService.create(payload as never)) as Member;
        toast.success('Member created successfully');
        navigate(`/members/${created.member_id}`);
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
        to={isEdit ? `/members/${id}` : '/members'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isEdit ? 'Edit Member' : 'New Member'}</h1>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEdit && (
          <>
        <NumberField
          name="member_id"
          label={"Member Id"}
          value={typeof values.member_id === 'number' ? values.member_id : ''}
          onChange={(v) => set('member_id', v)}
          required={false}
          error={errors.member_id}
          disabled={true}
        />
          </>
        )}
        <TextField
          name="facets_member_id"
          label={"Facets Member Id"}
          value={String(values.facets_member_id ?? '')}
          onChange={(v) => set('facets_member_id', v)}
          required={true}
          error={errors.facets_member_id}
          disabled={false}
        />
        <TextField
          name="epic_mrn"
          label={"Epic Mrn"}
          value={String(values.epic_mrn ?? '')}
          onChange={(v) => set('epic_mrn', v)}
          required={false}
          error={errors.epic_mrn}
          disabled={false}
        />
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
          options={['Male', 'Female', 'Non-Binary', 'Unknown']}
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
          name="phone"
          label={"Phone"}
          value={String(values.phone ?? '')}
          onChange={(v) => set('phone', v)}
          required={false}
          error={errors.phone}
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
          name="plan_type"
          label={"Plan Type"}
          value={String(values.plan_type ?? '')}
          onChange={(v) => set('plan_type', v)}
          options={['HMO', 'PPO', 'EPO', 'POS', 'MAPD', 'MA-Only']}
          required={true}
          error={errors.plan_type}
          disabled={false}
        />
        <SelectField
          name="coverage_start_date"
          label={"Coverage Start Date"}
          value={String(values.coverage_start_date ?? '')}
          onChange={(v) => set('coverage_start_date', v)}
          options={['In Network', 'Out of Network', 'Not Covered']}
          required={true}
          error={errors.coverage_start_date}
          disabled={false}
        />
        <SelectField
          name="coverage_end_date"
          label={"Coverage End Date"}
          value={String(values.coverage_end_date ?? '')}
          onChange={(v) => set('coverage_end_date', v)}
          options={['In Network', 'Out of Network', 'Not Covered']}
          required={false}
          error={errors.coverage_end_date}
          disabled={false}
        />
        <SelectField
          name="member_status"
          label={"Member Status"}
          value={String(values.member_status ?? '')}
          onChange={(v) => set('member_status', v)}
          options={['Active', 'Inactive', 'Termed']}
          required={true}
          error={errors.member_status}
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
            {isEdit ? 'Save changes' : 'Create Member'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
