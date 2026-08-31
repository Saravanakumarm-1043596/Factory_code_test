import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, Pencil as PencilIcon } from 'lucide-react';
import type { RuleIssue } from '../types/RuleIssue';
import type { FirewallRule } from '../types/FirewallRule';
import type { ChangeRequest } from '../types/ChangeRequest';
import type { ScanFinding } from '../types/ScanFinding';
import { ruleIssueService } from '../services/RuleIssueService';
import { firewallRuleService } from '../services/FirewallRuleService';
import { changeRequestService } from '../services/ChangeRequestService';
import { scanFindingService } from '../services/ScanFindingService';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { formatCell } from '../lib/format';

export function RuleIssueDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<RuleIssue | null>(null);
  const [loading, setLoading] = useState(true);
  const [firewall_rule_idTarget, setFirewall_rule_idTarget] = useState<FirewallRule | null>(null);
  const [related_rule_idTarget, setRelated_rule_idTarget] = useState<FirewallRule | null>(null);
  const [changeRequestLinkedRows, setChangeRequestLinkedRows] = useState<ChangeRequest[]>([]);
  const [scanFindingLinkedRows, setScanFindingLinkedRows] = useState<ScanFinding[]>([]);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await ruleIssueService.list();
      setRecord(rows.find((r) => String(r.rule_issue_id) === String(id)) ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Rule Issue');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [id]);

  useEffect(() => {
    const fkValue: unknown = record ? record.firewall_rule_id : null;
    if (fkValue === null || fkValue === undefined || fkValue === '') {
      setFirewall_rule_idTarget(null);
      return;
    }
    firewallRuleService.getById(fkValue as string | number)
      .then((row) => setFirewall_rule_idTarget(row ?? null))
      .catch(() => setFirewall_rule_idTarget(null));
  }, [record]);

  useEffect(() => {
    const fkValue: unknown = record ? record.related_rule_id : null;
    if (fkValue === null || fkValue === undefined || fkValue === '') {
      setRelated_rule_idTarget(null);
      return;
    }
    firewallRuleService.getById(fkValue as string | number)
      .then((row) => setRelated_rule_idTarget(row ?? null))
      .catch(() => setRelated_rule_idTarget(null));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    changeRequestService.list()
      .then((rows) => setChangeRequestLinkedRows(rows.filter((r) => String(r.rule_issue_id) === String(record.rule_issue_id))))
      .catch(() => setChangeRequestLinkedRows([]));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    scanFindingService.list()
      .then((rows) => setScanFindingLinkedRows(rows.filter((r) => String(r.rule_issue_id) === String(record.rule_issue_id))))
      .catch(() => setScanFindingLinkedRows([]));
  }, [record]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white shadow-sm p-4" />;
  }

  if (!record) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 text-center text-sm text-slate-500">
        Rule Issue not found.
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => navigate('/rule-issues')}>
            Back to Rule Issues
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/rule-issues')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Rule Issues
        </button>
        <Button icon={<PencilIcon className="h-4 w-4" />} onClick={() => navigate('/rule-issues/' + id + '/edit')}>
          Edit
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <h1 className="text-lg font-semibold text-slate-900">{formatCell(record.recommendation)}</h1>
        <p className="mt-1 text-sm text-slate-500">Rule Issue details</p>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Rule Issue Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.rule_issue_id)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Firewall Rule Id</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {firewall_rule_idTarget ? (
                <Link to={`/firewall-rules/${record.firewall_rule_id}`} className="text-brand-600 hover:underline">
                  {`${firewall_rule_idTarget.rule_name}`}
                </Link>
              ) : (
                formatCell(record.firewall_rule_id)
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Related Rule Id</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {related_rule_idTarget ? (
                <Link to={`/firewall-rules/${record.related_rule_id}`} className="text-brand-600 hover:underline">
                  {`${related_rule_idTarget.rule_name}`}
                </Link>
              ) : (
                formatCell(record.related_rule_id)
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Issue Type</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.issue_type)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Severity</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.severity)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.status)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Description</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.description)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Recommendation</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.recommendation)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Phi Exposure Risk</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.phi_exposure_risk)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Detected At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.detected_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Resolved At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.resolved_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Assigned To</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.assigned_to)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Notes</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.notes)}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <h2 className="text-sm font-semibold text-slate-900">Change Requests</h2>
        {changeRequestLinkedRows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No linked change requests.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {changeRequestLinkedRows.map((row) => (
              <li key={String(row.change_request_id)}>
                <Link to={`/change-requests/${row.change_request_id}`} className="block py-2 text-sm text-brand-600 hover:underline">
                  {formatCell(row.title)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <h2 className="text-sm font-semibold text-slate-900">Scan Findings</h2>
        {scanFindingLinkedRows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No linked scan findings.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {scanFindingLinkedRows.map((row) => (
              <li key={String(row.scan_finding_id)}>
                <Link to={`/scan-findings/${row.scan_finding_id}`} className="block py-2 text-sm text-brand-600 hover:underline">
                  {formatCell(row.detail)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
