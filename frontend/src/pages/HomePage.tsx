import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users as UsersIcon, Database as DatabaseIcon, Layers as LayersIcon, ClipboardList as ClipboardListIcon, Boxes as BoxesIcon, FileText as FileTextIcon, Building2 as Building2Icon, Tag as TagIcon, TrendingUp as TrendingUpIcon, Check as CheckIcon } from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { distribution, latestDate, sumBy, monthlySeries, groupByCount } from '../lib/aggregate';
import { TrendChart } from '../components/ui/TrendChart';
import { BreakdownChart } from '../components/ui/BreakdownChart';
import { Badge } from '../components/ui/Badge';
import { formatCell } from '../lib/format';
import type { FirewallRuleSet } from '../types/FirewallRuleSet';
import type { FirewallRule } from '../types/FirewallRule';
import type { RuleIssue } from '../types/RuleIssue';
import type { ChangeRequest } from '../types/ChangeRequest';
import type { AuditScan } from '../types/AuditScan';
import type { ScanFinding } from '../types/ScanFinding';
import type { ProtectedSystem } from '../types/ProtectedSystem';
import type { NetworkSecurityGroup } from '../types/NetworkSecurityGroup';
import type { Appliance } from '../types/Appliance';
import type { ComplianceMapping } from '../types/ComplianceMapping';
import { firewallRuleSetService } from '../services/FirewallRuleSetService';
import { firewallRuleService } from '../services/FirewallRuleService';
import { ruleIssueService } from '../services/RuleIssueService';
import { changeRequestService } from '../services/ChangeRequestService';
import { auditScanService } from '../services/AuditScanService';
import { scanFindingService } from '../services/ScanFindingService';
import { protectedSystemService } from '../services/ProtectedSystemService';
import { networkSecurityGroupService } from '../services/NetworkSecurityGroupService';
import { applianceService } from '../services/ApplianceService';
import { complianceMappingService } from '../services/ComplianceMappingService';

const firewallRuleSetDashboardBadgeColorMap: Record<string, string> = {
  'Active': 'indigo',
  'Under Review': 'emerald',
  'Deprecated': 'amber',
  'Archived': 'rose',
};

export function HomePage() {
  const [firewallRuleSetRows, setFirewallRuleSetRows] = useState<FirewallRuleSet[]>([]);
  const [firewallRuleRows, setFirewallRuleRows] = useState<FirewallRule[]>([]);
  const [ruleIssueRows, setRuleIssueRows] = useState<RuleIssue[]>([]);
  const [changeRequestRows, setChangeRequestRows] = useState<ChangeRequest[]>([]);
  const [auditScanRows, setAuditScanRows] = useState<AuditScan[]>([]);
  const [scanFindingRows, setScanFindingRows] = useState<ScanFinding[]>([]);
  const [protectedSystemRows, setProtectedSystemRows] = useState<ProtectedSystem[]>([]);
  const [networkSecurityGroupRows, setNetworkSecurityGroupRows] = useState<NetworkSecurityGroup[]>([]);
  const [applianceRows, setApplianceRows] = useState<Appliance[]>([]);
  const [complianceMappingRows, setComplianceMappingRows] = useState<ComplianceMapping[]>([]);

  useEffect(() => {
    firewallRuleSetService.list().then(setFirewallRuleSetRows);
    firewallRuleService.list().then(setFirewallRuleRows);
    ruleIssueService.list().then(setRuleIssueRows);
    changeRequestService.list().then(setChangeRequestRows);
    auditScanService.list().then(setAuditScanRows);
    scanFindingService.list().then(setScanFindingRows);
    protectedSystemService.list().then(setProtectedSystemRows);
    networkSecurityGroupService.list().then(setNetworkSecurityGroupRows);
    applianceService.list().then(setApplianceRows);
    complianceMappingService.list().then(setComplianceMappingRows);
  }, []);

  const firewallRuleSetSplit = useMemo(() => distribution(firewallRuleSetRows, 'status'), [firewallRuleSetRows]);
  const firewallRuleSplit = useMemo(() => distribution(firewallRuleRows, 'priority'), [firewallRuleRows]);
  const ruleIssueSplit = useMemo(() => distribution(ruleIssueRows, 'issue_type'), [ruleIssueRows]);
  const changeRequestSplit = useMemo(() => distribution(changeRequestRows, 'change_type'), [changeRequestRows]);
  const auditScanSplit = useMemo(() => distribution(auditScanRows, 'scan_type'), [auditScanRows]);
  const scanFindingSplit = useMemo(() => distribution(scanFindingRows, 'finding_type'), [scanFindingRows]);
  const protectedSystemSplit = useMemo(() => distribution(protectedSystemRows, 'system_type'), [protectedSystemRows]);
  const networkSecurityGroupLatest = useMemo(() => latestDate(networkSecurityGroupRows, 'last_synced_at'), [networkSecurityGroupRows]);
  const applianceSplit = useMemo(() => distribution(applianceRows, 'appliance_type'), [applianceRows]);
  const complianceMappingSplit = useMemo(() => distribution(complianceMappingRows, 'compliance_status'), [complianceMappingRows]);
  const firewallRuleSetNumericTotal = useMemo(() => sumBy(firewallRuleSetRows, 'rule_count'), [firewallRuleSetRows]);
  const firewallRuleSetTrend = useMemo(() => monthlySeries(firewallRuleSetRows, 'created_at'), [firewallRuleSetRows]);
  const firewallRuleSetBreakdown = useMemo(() => groupByCount(firewallRuleSetRows, 'status'), [firewallRuleSetRows]);
  const firewallRuleSetRecent = useMemo(() => [...firewallRuleSetRows].slice(0, 5), [firewallRuleSetRows]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="relative isolate flex flex-col overflow-hidden rounded-xl bg-gradient-to-b from-brand-900 to-brand-700 px-7 py-8 lg:col-span-5">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-1 flex-col">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/50">Portal overview</p>
            <h2 className="mt-3 font-heading text-2xl font-semibold leading-snug tracking-tight text-white">Welcome to Acme Health S Firewall Rule Sets Across</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/75">This app helps Acme Healths network security team identify and resolve redundant, shadowed, and conflicting firewall rules across Azure network security groups and appliances. It streamlines change-request cycles, tracks compliance against healthcare frameworks, and reduces the attack surface protecting PHI-bearing systems like Facets and Epic.</p>
            <div className="mt-auto pt-6">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-white/50">What you can do here</p>
              <ul className="space-y-2 text-sm leading-relaxed text-white/80">
                <li className="flex items-start gap-2.5">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 flex-none text-white/60" />
                  <span>Identify redundant and conflicting firewall rules</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 flex-none text-white/60" />
                  <span>Track and resolve rule issues by severity</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 flex-none text-white/60" />
                  <span>Submit and approve firewall change requests</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 flex-none text-white/60" />
                  <span>Audit rule sets for PHI exposure risks</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 flex-none text-white/60" />
                  <span>Map firewall controls to compliance frameworks</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
        <div className="h-full lg:col-span-7">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 h-full auto-rows-fr">
        <StatCard label="Total Firewall Rule Sets" value={firewallRuleSetRows.length} icon={UsersIcon} to="/firewall-rule-sets" hint={firewallRuleSetSplit} />
        <StatCard label="Total Firewall Rules" value={firewallRuleRows.length} icon={DatabaseIcon} to="/firewall-rules" hint={firewallRuleSplit} />
        <StatCard label="Total Rule Issues" value={ruleIssueRows.length} icon={LayersIcon} to="/rule-issues" hint={ruleIssueSplit} />
        <StatCard label="Total Change Requests" value={changeRequestRows.length} icon={ClipboardListIcon} to="/change-requests" hint={changeRequestSplit} />
        <StatCard label="Total Audit Scans" value={auditScanRows.length} icon={BoxesIcon} to="/audit-scans" hint={auditScanSplit} />
        <StatCard label="Total Scan Findings" value={scanFindingRows.length} icon={FileTextIcon} to="/scan-findings" hint={scanFindingSplit} />
        <StatCard label="Total Protected Systems" value={protectedSystemRows.length} icon={Building2Icon} to="/protected-systems" hint={protectedSystemSplit} />
        <StatCard label="Total Network Security Groups" value={networkSecurityGroupRows.length} icon={TagIcon} to="/network-security-groups" hint={networkSecurityGroupLatest} />
        <StatCard label="Total Appliances" value={applianceRows.length} icon={UsersIcon} to="/appliances" hint={applianceSplit} />
        <StatCard label="Total Compliance Mappings" value={complianceMappingRows.length} icon={DatabaseIcon} to="/compliance-mappings" hint={complianceMappingSplit} />
        <StatCard label="Total Rule Count" value={firewallRuleSetNumericTotal.toLocaleString()} icon={TrendingUpIcon} accent="bg-emerald-50 text-emerald-600" />
      </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TrendChart title="Firewall Rule Set over time" subtitle="New firewall rule sets per month" data={firewallRuleSetTrend} />
        <BreakdownChart title="Firewall Rule Set by Status" data={firewallRuleSetBreakdown} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="p-4 pb-0">
          <h3 className="text-sm font-semibold text-slate-900">Recent Firewall Rule Sets</h3>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr>
              <th className="px-4 py-3.5 sm:px-6 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Name</th>
              <th className="px-4 py-3.5 sm:px-6 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-4 py-3.5 sm:px-6 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Created At</th>
              <th className="px-4 py-3.5 sm:px-6 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Rule Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {firewallRuleSetRecent.map((row) => (
                <tr key={String(row.firewall_rule_set_id)}>
                <td className="px-4 py-3.5 sm:px-6 text-sm text-slate-700">{formatCell(row.name)}</td>
                <td className="px-4 py-3.5 sm:px-6 text-sm"><Badge label={String(row.status ?? '—')} color={firewallRuleSetDashboardBadgeColorMap[String(row.status)]} /></td>
                <td className="px-4 py-3.5 sm:px-6 text-sm text-slate-700">{formatCell(row.created_at)}</td>
                <td className="px-4 py-3.5 sm:px-6 text-sm text-slate-700">{formatCell(row.rule_count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {firewallRuleSetRecent.length === 0 && (
            <p className="p-4 pt-0 text-sm text-slate-500">No data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
