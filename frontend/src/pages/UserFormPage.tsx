import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import type { User } from '../types/User';
import { userService } from '../services/UserService';
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

type FormState = Record<string, unknown>;

function emptyForm(): FormState {
  return {
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: '',
    department: '',
    is_active: false,
    last_login: '',
    created_at: '',
  };
}

function omitKey<T extends Record<string, unknown>>(obj: T, key: string): Record<string, unknown> {
  const { [key]: _omitted, ...rest } = obj;
  return rest;
}

export function UserFormPage() {
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
    userService.list()
      .then((rows) => {
        const found = rows.find((r) => String(r.user_id) === String(id));
        if (found) setValues({ ...found });
      })
      .catch(() => toast.error('Failed to load User'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function set(name: string, value: unknown) {
    setValues((s) => ({ ...s, [name]: value }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!values.username && values.username !== 0 && values.username !== false) nextErrors.username = "Username is required";
    if (!values.email && values.email !== 0 && values.email !== false) nextErrors.email = "Email is required";
    if (!values.first_name && values.first_name !== 0 && values.first_name !== false) nextErrors.first_name = "First Name is required";
    if (!values.last_name && values.last_name !== 0 && values.last_name !== false) nextErrors.last_name = "Last Name is required";
    if (!values.role && values.role !== 0 && values.role !== false) nextErrors.role = "Role is required";
    if (!values.department && values.department !== 0 && values.department !== false) nextErrors.department = "Department is required";
    if (!values.is_active && values.is_active !== 0 && values.is_active !== false) nextErrors.is_active = "Is Active is required";
    if (!values.created_at && values.created_at !== 0 && values.created_at !== false) nextErrors.created_at = "Created At is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = omitKey(values, 'user_id');
      if (isEdit) {
        await userService.update(id as never, payload as never);
        toast.success('User updated successfully');
        navigate(`/users/${id}`);
      } else {
        const created = (await userService.create(payload as never)) as User;
        toast.success('User created successfully');
        navigate(`/users/${created.user_id}`);
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
        to={isEdit ? `/users/${id}` : '/users'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isEdit ? 'Edit User' : 'New User'}</h1>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEdit && (
          <>
        <NumberField
          name="user_id"
          label={"User Id"}
          value={typeof values.user_id === 'number' ? values.user_id : ''}
          onChange={(v) => set('user_id', v)}
          required={false}
          error={errors.user_id}
          disabled={true}
        />
          </>
        )}
        <TextField
          name="username"
          label={"Username"}
          value={String(values.username ?? '')}
          onChange={(v) => set('username', v)}
          required={true}
          error={errors.username}
          disabled={false}
        />
        <TextField
          name="email"
          label={"Email"}
          value={String(values.email ?? '')}
          onChange={(v) => set('email', v)}
          required={true}
          error={errors.email}
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
        <SelectField
          name="role"
          label={"Role"}
          value={String(values.role ?? '')}
          onChange={(v) => set('role', v)}
          options={['Lab Admin', 'Claims Analyst', 'Compliance Officer', 'Supervisor', 'System Admin', 'Read Only']}
          required={true}
          error={errors.role}
          disabled={false}
        />
        <SelectField
          name="department"
          label={"Department"}
          value={String(values.department ?? '')}
          onChange={(v) => set('department', v)}
          options={['Lab Operations', 'Claims', 'Compliance', 'IT', 'Medical Management']}
          required={true}
          error={errors.department}
          disabled={false}
        />
        <CheckboxField
          name="is_active"
          label={"Is Active"}
          value={Boolean(values.is_active)}
          onChange={(v) => set('is_active', v)}
          disabled={false}
        />
        <DateField
          name="last_login"
          label={"Last Login"}
          value={toDateInputValue(values.last_login)}
          onChange={(v) => set('last_login', v)}
          required={false}
          error={errors.last_login}
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
            {isEdit ? 'Save changes' : 'Create User'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
