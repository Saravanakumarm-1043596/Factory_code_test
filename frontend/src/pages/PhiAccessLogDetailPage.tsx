import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, Pencil as PencilIcon } from 'lucide-react';
import type { PhiAccessLog } from '../types/PhiAccessLog';
import type { User } from '../types/User';
import { phiAccessLogService } from '../services/PhiAccessLogService';
import { userService } from '../services/UserService';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { formatCell } from '../lib/format';

export function PhiAccessLogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<PhiAccessLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [user_idTarget, setUser_idTarget] = useState<User | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await phiAccessLogService.list();
      setRecord(rows.find((r) => String(r.phi_access_log_id) === String(id)) ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Phi Access Log');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [id]);

  useEffect(() => {
    const fkValue: unknown = record ? record.user_id : null;
    if (fkValue === null || fkValue === undefined || fkValue === '') {
      setUser_idTarget(null);
      return;
    }
    userService.getById(fkValue as string | number)
      .then((row) => setUser_idTarget(row ?? null))
      .catch(() => setUser_idTarget(null));
  }, [record]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-md border border-slate-200 bg-white p-3.5" />;
  }

  if (!record) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-3.5 text-center text-sm text-slate-500">
        Phi Access Log not found.
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => navigate('/phi-access-logs')}>
            Back to Phi Access Logs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/phi-access-logs')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Phi Access Logs
        </button>
        <Button icon={<PencilIcon className="h-4 w-4" />} onClick={() => navigate('/phi-access-logs/' + id + '/edit')}>
          Edit
        </Button>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h1 className="text-lg font-semibold text-slate-900">{formatCell(record.ip_address)}</h1>
        <p className="mt-1 text-sm text-slate-500">Phi Access Log details</p>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Phi Access Log Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.phi_access_log_id)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">User Id</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {user_idTarget ? (
                <Link to={`/users/${record.user_id}`} className="text-brand-600 hover:underline">
                  {`${user_idTarget.first_name}`}
                </Link>
              ) : (
                formatCell(record.user_id)
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Entity Type</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.entity_type)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Entity Record Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.entity_record_id)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Access Type</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.access_type)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Source System</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.source_system)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Access Reason</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.access_reason)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Ip Address</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.ip_address)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Access Timestamp</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.access_timestamp)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Phi Fields Accessed</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.phi_fields_accessed)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Was Authorized</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.was_authorized)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Notes</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.notes)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
