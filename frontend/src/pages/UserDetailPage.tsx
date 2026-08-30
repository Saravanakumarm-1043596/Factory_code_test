import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, Pencil as PencilIcon } from 'lucide-react';
import type { User } from '../types/User';
import type { PhiAccessLog } from '../types/PhiAccessLog';
import { userService } from '../services/UserService';
import { phiAccessLogService } from '../services/PhiAccessLogService';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { formatCell } from '../lib/format';

export function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [phiAccessLogLinkedRows, setPhiAccessLogLinkedRows] = useState<PhiAccessLog[]>([]);
  const [attachmentRows, setAttachmentRows] = useState<PhiAccessLog[]>([]);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await userService.list();
      setRecord(rows.find((r) => String(r.user_id) === String(id)) ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load User');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [id]);

  useEffect(() => {
    if (!record) return;
    phiAccessLogService.list()
      .then((rows) => setPhiAccessLogLinkedRows(rows.filter((r) => String(r.user_id) === String(record.user_id))))
      .catch(() => setPhiAccessLogLinkedRows([]));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    phiAccessLogService.list()
      .then((rows) =>
        setAttachmentRows(
          rows.filter(
            (r) => String(r.entity_type) === "User" && String(r.entity_record_id) === String(record.user_id),
          ),
        ),
      )
      .catch(() => setAttachmentRows([]));
  }, [record]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-md border border-slate-200 bg-white p-3.5" />;
  }

  if (!record) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-3.5 text-center text-sm text-slate-500">
        User not found.
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => navigate('/users')}>
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/users')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Users
        </button>
        <Button icon={<PencilIcon className="h-4 w-4" />} onClick={() => navigate('/users/' + id + '/edit')}>
          Edit
        </Button>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h1 className="text-lg font-semibold text-slate-900">{formatCell(record.first_name)}</h1>
        <p className="mt-1 text-sm text-slate-500">User details</p>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">User Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.user_id)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Username</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.username)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.email)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">First Name</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.first_name)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Last Name</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.last_name)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Role</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.role)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Department</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.department)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Is Active</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.is_active)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Last Login</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.last_login)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Created At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.created_at)}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h2 className="text-sm font-semibold text-slate-900">Phi Access Logs</h2>
        {phiAccessLogLinkedRows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No linked phi access logs.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {phiAccessLogLinkedRows.map((row) => (
              <li key={String(row.phi_access_log_id)}>
                <Link to={`/phi-access-logs/${row.phi_access_log_id}`} className="block py-2 text-sm text-brand-600 hover:underline">
                  {formatCell(row.ip_address)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h2 className="text-sm font-semibold text-slate-900">Attachments</h2>
        {attachmentRows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No attachments.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {attachmentRows.map((row) => (
              <li key={String(row.phi_access_log_id)} className="flex items-center justify-between py-2 text-sm">
                <span className="text-slate-700">{formatCell(row.ip_address)}</span>

              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
