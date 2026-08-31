import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, Pencil as PencilIcon, Download as DownloadIcon } from 'lucide-react';
import type { ChangeRequest } from '../types/ChangeRequest';
import type { FirewallRuleSet } from '../types/FirewallRuleSet';
import type { RuleIssue } from '../types/RuleIssue';
import { changeRequestService } from '../services/ChangeRequestService';
import { firewallRuleSetService } from '../services/FirewallRuleSetService';
import { ruleIssueService } from '../services/RuleIssueService';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { formatCell } from '../lib/format';

export function ChangeRequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<ChangeRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [firewall_rule_set_idTarget, setFirewall_rule_set_idTarget] = useState<FirewallRuleSet | null>(null);
  const [rule_issue_idTarget, setRule_issue_idTarget] = useState<RuleIssue | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await changeRequestService.list();
      setRecord(rows.find((r) => String(r.change_request_id) === String(id)) ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Change Request');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [id]);

  useEffect(() => {
    const fkValue: unknown = record ? record.firewall_rule_set_id : null;
    if (fkValue === null || fkValue === undefined || fkValue === '') {
      setFirewall_rule_set_idTarget(null);
      return;
    }
    firewallRuleSetService.getById(fkValue as string | number)
      .then((row) => setFirewall_rule_set_idTarget(row ?? null))
      .catch(() => setFirewall_rule_set_idTarget(null));
  }, [record]);

  useEffect(() => {
    const fkValue: unknown = record ? record.rule_issue_id : null;
    if (fkValue === null || fkValue === undefined || fkValue === '') {
      setRule_issue_idTarget(null);
      return;
    }
    ruleIssueService.getById(fkValue as string | number)
      .then((row) => setRule_issue_idTarget(row ?? null))
      .catch(() => setRule_issue_idTarget(null));
  }, [record]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white shadow-sm p-4" />;
  }

  if (!record) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 text-center text-sm text-slate-500">
        Change Request not found.
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => navigate('/change-requests')}>
            Back to Change Requests
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/change-requests')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Change Requests
        </button>
        <Button icon={<PencilIcon className="h-4 w-4" />} onClick={() => navigate('/change-requests/' + id + '/edit')}>
          Edit
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <h1 className="text-lg font-semibold text-slate-900">{formatCell(record.title)}</h1>
        <p className="mt-1 text-sm text-slate-500">Change Request details</p>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Change Request Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.change_request_id)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Title</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.title)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Description</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.description)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Firewall Rule Set Id</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {firewall_rule_set_idTarget ? (
                <Link to={`/firewall-rule-sets/${record.firewall_rule_set_id}`} className="text-brand-600 hover:underline">
                  {`${firewall_rule_set_idTarget.name}`}
                </Link>
              ) : (
                formatCell(record.firewall_rule_set_id)
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Change Type</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.change_type)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.status)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Priority</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.priority)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Requestor</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.requestor)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Approver</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.approver)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Justification</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.justification)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Risk Assessment</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.risk_assessment)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Rule Issue Id</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {rule_issue_idTarget ? (
                <Link to={`/rule-issues/${record.rule_issue_id}`} className="text-brand-600 hover:underline">
                  {`${rule_issue_idTarget.recommendation}`}
                </Link>
              ) : (
                formatCell(record.rule_issue_id)
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Implementation Notes</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.implementation_notes)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Attachment</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {record.attachment ? (
                <a href={String(record.attachment)} download className="inline-flex items-center gap-1 text-brand-600 hover:underline">
                  <DownloadIcon className="h-3.5 w-3.5" /> Download
                </a>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Submitted At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.submitted_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Approved At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.approved_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Implemented At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.implemented_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Created At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.created_at)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
