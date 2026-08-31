import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import type { PredictiveModel } from '../types/PredictiveModel';
import { predictiveModelService } from '../services/PredictiveModelService';
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
    model_name: '',
    model_version: '',
    model_type: '',
    status: '',
    accuracy_score: '',
    auc_roc_score: '',
    training_record_count: '',
    trained_at: '',
    deployed_at: '',
    model_artifact: '',
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

export function PredictiveModelFormPage() {
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
    predictiveModelService.list()
      .then((rows) => {
        const found = rows.find((r) => String(r.predictive_model_id) === String(id));
        if (found) setValues({ ...found });
      })
      .catch(() => toast.error('Failed to load Predictive Model'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function set(name: string, value: unknown) {
    setValues((s) => ({ ...s, [name]: value }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!values.model_name && values.model_name !== 0 && values.model_name !== false) nextErrors.model_name = "Model Name is required";
    if (!values.model_version && values.model_version !== 0 && values.model_version !== false) nextErrors.model_version = "Model Version is required";
    if (!values.model_type && values.model_type !== 0 && values.model_type !== false) nextErrors.model_type = "Model Type is required";
    if (!values.status && values.status !== 0 && values.status !== false) nextErrors.status = "Status is required";
    if (!values.training_record_count && values.training_record_count !== 0 && values.training_record_count !== false) nextErrors.training_record_count = "Training Record Count is required";
    if (!values.trained_at && values.trained_at !== 0 && values.trained_at !== false) nextErrors.trained_at = "Trained At is required";
    if (!values.created_at && values.created_at !== 0 && values.created_at !== false) nextErrors.created_at = "Created At is required";
    if (!values.updated_at && values.updated_at !== 0 && values.updated_at !== false) nextErrors.updated_at = "Updated At is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = omitKey(values, 'predictive_model_id');
      if (isEdit) {
        await predictiveModelService.uploadUpdate(id as never, toFormData(payload));
        toast.success('Predictive Model updated successfully');
        navigate(`/predictive-models/${id}`);
      } else {
        const created = (await predictiveModelService.uploadCreate(toFormData(payload))) as PredictiveModel;
        toast.success('Predictive Model created successfully');
        navigate(`/predictive-models/${created.predictive_model_id}`);
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
        to={isEdit ? `/predictive-models/${id}` : '/predictive-models'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{isEdit ? 'Edit Predictive Model' : 'New Predictive Model'}</h1>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEdit && (
          <>
        <TextField
          name="predictive_model_id"
          label={"Predictive Model Id"}
          value={String(values.predictive_model_id ?? '')}
          onChange={(v) => set('predictive_model_id', v)}
          required={false}
          error={errors.predictive_model_id}
          disabled={true}
        />
          </>
        )}
        <TextField
          name="model_name"
          label={"Model Name"}
          value={String(values.model_name ?? '')}
          onChange={(v) => set('model_name', v)}
          required={true}
          error={errors.model_name}
          disabled={false}
        />
        <TextField
          name="model_version"
          label={"Model Version"}
          value={String(values.model_version ?? '')}
          onChange={(v) => set('model_version', v)}
          required={true}
          error={errors.model_version}
          disabled={false}
        />
        <SelectField
          name="model_type"
          label={"Model Type"}
          value={String(values.model_type ?? '')}
          onChange={(v) => set('model_type', v)}
          options={['No-Show Prediction', 'Optimal Slot Recommendation', 'Overbooking Optimization', 'Demand Forecasting']}
          required={true}
          error={errors.model_type}
          disabled={false}
        />
        <SelectField
          name="status"
          label={"Status"}
          value={String(values.status ?? '')}
          onChange={(v) => set('status', v)}
          options={['Training', 'Validating', 'Active', 'Deprecated', 'Retired']}
          required={true}
          error={errors.status}
          disabled={false}
        />
        <NumberField
          name="accuracy_score"
          label={"Accuracy Score"}
          value={typeof values.accuracy_score === 'number' ? values.accuracy_score : ''}
          onChange={(v) => set('accuracy_score', v)}
          required={false}
          error={errors.accuracy_score}
          disabled={false}
        />
        <NumberField
          name="auc_roc_score"
          label={"Auc Roc Score"}
          value={typeof values.auc_roc_score === 'number' ? values.auc_roc_score : ''}
          onChange={(v) => set('auc_roc_score', v)}
          required={false}
          error={errors.auc_roc_score}
          disabled={false}
        />
        <NumberField
          name="training_record_count"
          label={"Training Record Count"}
          value={typeof values.training_record_count === 'number' ? values.training_record_count : ''}
          onChange={(v) => set('training_record_count', v)}
          required={true}
          error={errors.training_record_count}
          disabled={false}
        />
        <DateField
          name="trained_at"
          label={"Trained At"}
          value={toDateInputValue(values.trained_at)}
          onChange={(v) => set('trained_at', v)}
          required={true}
          error={errors.trained_at}
          disabled={false}
        />
        <DateField
          name="deployed_at"
          label={"Deployed At"}
          value={toDateInputValue(values.deployed_at)}
          onChange={(v) => set('deployed_at', v)}
          required={false}
          error={errors.deployed_at}
          disabled={false}
        />
        <FileUploadField
          name="model_artifact"
          label={"Model Artifact"}
          value={String(values.model_artifact ?? '')}
          fileLabel={values.model_artifact ? "Model Artifact" : undefined}
          accept={['.pdf', '.jpg', '.jpeg', '.png']}
          maxSizeMb={10}
          required={false}
          error={errors.model_artifact}
          disabled={false}
          downloadHref={values.model_artifact ? String(values.model_artifact) : undefined}
          onSelect={(file, dataUrl) => {
            const ext = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase() : '';
            if (!['.pdf', '.jpg', '.jpeg', '.png'].includes(ext)) {
              setErrors((prev) => ({ ...prev, model_artifact: `File type not allowed. Allowed: ${['.pdf', '.jpg', '.jpeg', '.png'].join(', ')}` }));
              return;
            }
            if (file.size > 10 * 1024 * 1024) {
              setErrors((prev) => ({ ...prev, model_artifact: 'File must be smaller than 10MB' }));
              return;
            }
            setErrors((prev) => {
              const next = { ...prev };
              delete next.model_artifact;
              return next;
            });
            set('model_artifact', dataUrl);
          }}
          onRemove={() => {
            set('model_artifact', '');
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
            {isEdit ? 'Save changes' : 'Create Predictive Model'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
