import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, Pencil as PencilIcon } from 'lucide-react';
import type { FirewallRule } from '../types/FirewallRule';
import type { FirewallRuleSet } from '../types/FirewallRuleSet';
import type { RuleIssue } from '../types/RuleIssue';
import type { ScanFinding } from '../types/ScanFinding';
import { firewallRuleService } from '../services/FirewallRuleService';
import { firewallRuleSetService } from '../services/FirewallRuleSetService';
import { ruleIssueService } from '../services/RuleIssueService';
import { scanFindingService } from '../services/ScanFindingService';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { formatCell } from '../lib/format';

export function FirewallRuleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<FirewallRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [firewall_rule_set_idTarget, setFirewall_rule_set_idTarget] = useState<FirewallRuleSet | null>(null);
  const [ruleIssueLinkedRows, setRuleIssueLinkedRows] = useState<RuleIssue[]>([]);
  const [ruleIssueRelatedRuleIdLinkedRows, setRuleIssueRelatedRuleIdLinkedRows] = useState<RuleIssue[]>([]);
  const [scanFindingLinkedRows, setScanFindingLinkedRows] = useState<ScanFinding[]>([]);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await firewallRuleService.list();
      setRecord(rows.find((r) => String(r.firewall_rule_id) === String(id)) ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Firewall Rule');
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
    if (!record) return;
    ruleIssueService.list()
      .then((rows) => setRuleIssueLinkedRows(rows.filter((r) => String(r.firewall_rule_id) === String(record.firewall_rule_id))))
      .catch(() => setRuleIssueLinkedRows([]));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    ruleIssueService.list()
      .then((rows) => setRuleIssueRelatedRuleIdLinkedRows(rows.filter((r) => String(r.related_rule_id) === String(record.firewall_rule_id))))
      .catch(() => setRuleIssueRelatedRuleIdLinkedRows([]));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    scanFindingService.list()
      .then((rows) => setScanFindingLinkedRows(rows.filter((r) => String(r.firewall_rule_id) === String(record.firewall_rule_id))))
      .catch(() => setScanFindingLinkedRows([]));
  }, [record]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white shadow-sm p-4" />;
  }

  if (!record) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 text-center text-sm text-slate-500">
        Firewall Rule not found.
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => navigate('/firewall-rules')}>
            Back to Firewall Rules
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/firewall-rules')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Firewall Rules
        </button>
        <Button icon={<PencilIcon className="h-4 w-4" />} onClick={() => navigate('/firewall-rules/' + id + '/edit')}>
          Edit
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <h1 className="text-lg font-semibold text-slate-900">{formatCell(record.rule_name)}</h1>
        <p className="mt-1 text-sm text-slate-500">Firewall Rule details</p>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Firewall Rule Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.firewall_rule_id)}</dd>
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
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Rule Name</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.rule_name)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Priority</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.priority)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Direction</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.direction)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Action</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.action)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Protocol</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.protocol)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Source Address</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.source_address)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Source Port Range</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.source_port_range)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Destination Address</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.destination_address)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Destination Port Range</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.destination_port_range)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Is Enabled</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.is_enabled)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Description</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.description)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Last Hit At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.last_hit_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Hit Count</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.hit_count)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Created At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.created_at)}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <h2 className="text-sm font-semibold text-slate-900">Rule Issues</h2>
        {ruleIssueLinkedRows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No linked rule issues.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {ruleIssueLinkedRows.map((row) => (
              <li key={String(row.rule_issue_id)}>
                <Link to={`/rule-issues/${row.rule_issue_id}`} className="block py-2 text-sm text-brand-600 hover:underline">
                  {formatCell(row.recommendation)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <h2 className="text-sm font-semibold text-slate-900">Rule Issues (Related Rule Id)</h2>
        {ruleIssueRelatedRuleIdLinkedRows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No linked rule issues.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {ruleIssueRelatedRuleIdLinkedRows.map((row) => (
              <li key={String(row.rule_issue_id)}>
                <Link to={`/rule-issues/${row.rule_issue_id}`} className="block py-2 text-sm text-brand-600 hover:underline">
                  {formatCell(row.recommendation)}
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
