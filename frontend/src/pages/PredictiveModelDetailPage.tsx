import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, Pencil as PencilIcon, Download as DownloadIcon } from 'lucide-react';
import type { PredictiveModel } from '../types/PredictiveModel';

import { predictiveModelService } from '../services/PredictiveModelService';

import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { formatCell } from '../lib/format';

export function PredictiveModelDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<PredictiveModel | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await predictiveModelService.list();
      setRecord(rows.find((r) => String(r.predictive_model_id) === String(id)) ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Predictive Model');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [id]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-md border border-slate-200 bg-white p-3.5" />;
  }

  if (!record) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-3.5 text-center text-sm text-slate-500">
        Predictive Model not found.
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => navigate('/predictive-models')}>
            Back to Predictive Models
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/predictive-models')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Predictive Models
        </button>
        <Button icon={<PencilIcon className="h-4 w-4" />} onClick={() => navigate('/predictive-models/' + id + '/edit')}>
          Edit
        </Button>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h1 className="text-lg font-semibold text-slate-900">{formatCell(record.model_name)}</h1>
        <p className="mt-1 text-sm text-slate-500">Predictive Model details</p>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Predictive Model Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.predictive_model_id)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Model Name</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.model_name)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Model Version</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.model_version)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Model Type</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.model_type)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.status)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Accuracy Score</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.accuracy_score)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Auc Roc Score</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.auc_roc_score)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Training Record Count</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.training_record_count)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Trained At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.trained_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Deployed At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.deployed_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Model Artifact</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {record.model_artifact ? (
                <a href={String(record.model_artifact)} download className="inline-flex items-center gap-1 text-brand-600 hover:underline">
                  <DownloadIcon className="h-3.5 w-3.5" /> Download
                </a>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Created At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.created_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Updated At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.updated_at)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
