import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, Pencil as PencilIcon } from 'lucide-react';
import type { ScanFinding } from '../types/ScanFinding';
import type { AuditScan } from '../types/AuditScan';
import type { RuleIssue } from '../types/RuleIssue';
import type { FirewallRule } from '../types/FirewallRule';
import { scanFindingService } from '../services/ScanFindingService';
import { auditScanService } from '../services/AuditScanService';
import { ruleIssueService } from '../services/RuleIssueService';
import { firewallRuleService } from '../services/FirewallRuleService';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { formatCell } from '../lib/format';

export function ScanFindingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<ScanFinding | null>(null);
  const [loading, setLoading] = useState(true);
  const [audit_scan_idTarget, setAudit_scan_idTarget] = useState<AuditScan | null>(null);
  const [rule_issue_idTarget, setRule_issue_idTarget] = useState<RuleIssue | null>(null);
  const [firewall_rule_idTarget, setFirewall_rule_idTarget] = useState<FirewallRule | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await scanFindingService.list();
      setRecord(rows.find((r) => String(r.scan_finding_id) === String(id)) ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Scan Finding');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [id]);

  useEffect(() => {
    const fkValue: unknown = record ? record.audit_scan_id : null;
    if (fkValue === null || fkValue === undefined || fkValue === '') {
      setAudit_scan_idTarget(null);
      return;
    }
    auditScanService.getById(fkValue as string | number)
      .then((row) => setAudit_scan_idTarget(row ?? null))
      .catch(() => setAudit_scan_idTarget(null));
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

  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white shadow-sm p-4" />;
  }

  if (!record) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 text-center text-sm text-slate-500">
        Scan Finding not found.
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => navigate('/scan-findings')}>
            Back to Scan Findings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/scan-findings')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Scan Findings
        </button>
        <Button icon={<PencilIcon className="h-4 w-4" />} onClick={() => navigate('/scan-findings/' + id + '/edit')}>
          Edit
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <h1 className="text-lg font-semibold text-slate-900">{formatCell(record.detail)}</h1>
        <p className="mt-1 text-sm text-slate-500">Scan Finding details</p>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Scan Finding Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.scan_finding_id)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Audit Scan Id</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {audit_scan_idTarget ? (
                <Link to={`/audit-scans/${record.audit_scan_id}`} className="text-brand-600 hover:underline">
                  {`${audit_scan_idTarget.scan_name}`}
                </Link>
              ) : (
                formatCell(record.audit_scan_id)
              )}
            </dd>
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
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Finding Type</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.finding_type)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Severity</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.severity)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Detail</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.detail)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Auto Resolved</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.auto_resolved)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Detected At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.detected_at)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
