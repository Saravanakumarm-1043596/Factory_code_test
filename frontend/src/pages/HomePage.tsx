import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users as UsersIcon, Database as DatabaseIcon, Layers as LayersIcon, ClipboardList as ClipboardListIcon, Boxes as BoxesIcon, FileText as FileTextIcon, Building2 as Building2Icon, Tag as TagIcon, TrendingUp as TrendingUpIcon, Check as CheckIcon } from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { distribution, countThisMonth, sumBy, monthlySeries, groupByCount } from '../lib/aggregate';
import { TrendChart } from '../components/ui/TrendChart';
import { BreakdownChart } from '../components/ui/BreakdownChart';
import { Badge } from '../components/ui/Badge';
import { formatCell } from '../lib/format';
import type { LabTestOrder } from '../types/LabTestOrder';
import type { LabTestLine } from '../types/LabTestLine';
import type { Claim } from '../types/Claim';
import type { ClaimLine } from '../types/ClaimLine';
import type { ClaimError } from '../types/ClaimError';
import type { Member } from '../types/Member';
import type { Provider } from '../types/Provider';
import type { PhiAccessLog } from '../types/PhiAccessLog';
import type { ComplianceControl } from '../types/ComplianceControl';
import type { ComplianceFinding } from '../types/ComplianceFinding';
import type { LineOfBusiness } from '../types/LineOfBusiness';
import type { User } from '../types/User';
import { labTestOrderService } from '../services/LabTestOrderService';
import { labTestLineService } from '../services/LabTestLineService';
import { claimService } from '../services/ClaimService';
import { claimLineService } from '../services/ClaimLineService';
import { claimErrorService } from '../services/ClaimErrorService';
import { memberService } from '../services/MemberService';
import { providerService } from '../services/ProviderService';
import { phiAccessLogService } from '../services/PhiAccessLogService';
import { complianceControlService } from '../services/ComplianceControlService';
import { complianceFindingService } from '../services/ComplianceFindingService';
import { lineOfBusinessService } from '../services/LineOfBusinessService';
import { userService } from '../services/UserService';

const claimDashboardBadgeColorMap: Record<string, string> = {
  'Professional': 'indigo',
  'Institutional': 'emerald',
};

export function HomePage() {
  const [labTestOrderRows, setLabTestOrderRows] = useState<LabTestOrder[]>([]);
  const [labTestLineRows, setLabTestLineRows] = useState<LabTestLine[]>([]);
  const [claimRows, setClaimRows] = useState<Claim[]>([]);
  const [claimLineRows, setClaimLineRows] = useState<ClaimLine[]>([]);
  const [claimErrorRows, setClaimErrorRows] = useState<ClaimError[]>([]);
  const [memberRows, setMemberRows] = useState<Member[]>([]);
  const [providerRows, setProviderRows] = useState<Provider[]>([]);
  const [phiAccessLogRows, setPhiAccessLogRows] = useState<PhiAccessLog[]>([]);
  const [complianceControlRows, setComplianceControlRows] = useState<ComplianceControl[]>([]);
  const [complianceFindingRows, setComplianceFindingRows] = useState<ComplianceFinding[]>([]);
  const [lineOfBusinessRows, setLineOfBusinessRows] = useState<LineOfBusiness[]>([]);
  const [userRows, setUserRows] = useState<User[]>([]);

  useEffect(() => {
    labTestOrderService.list().then(setLabTestOrderRows);
    labTestLineService.list().then(setLabTestLineRows);
    claimService.list().then(setClaimRows);
    claimLineService.list().then(setClaimLineRows);
    claimErrorService.list().then(setClaimErrorRows);
    memberService.list().then(setMemberRows);
    providerService.list().then(setProviderRows);
    phiAccessLogService.list().then(setPhiAccessLogRows);
    complianceControlService.list().then(setComplianceControlRows);
    complianceFindingService.list().then(setComplianceFindingRows);
    lineOfBusinessService.list().then(setLineOfBusinessRows);
    userService.list().then(setUserRows);
  }, []);

  const labTestOrderSplit = useMemo(() => distribution(labTestOrderRows, 'order_status'), [labTestOrderRows]);
  const labTestLineSplit = useMemo(() => distribution(labTestLineRows, 'test_category'), [labTestLineRows]);
  const claimSplit = useMemo(() => distribution(claimRows, 'claim_type'), [claimRows]);
  const claimLineSplit = useMemo(() => distribution(claimLineRows, 'line_status'), [claimLineRows]);
  const claimErrorSplit = useMemo(() => distribution(claimErrorRows, 'error_category'), [claimErrorRows]);
  const memberSplit = useMemo(() => distribution(memberRows, 'gender'), [memberRows]);
  const providerSplit = useMemo(() => distribution(providerRows, 'provider_type'), [providerRows]);
  const phiAccessLogSplit = useMemo(() => distribution(phiAccessLogRows, 'entity_type'), [phiAccessLogRows]);
  const complianceControlSplit = useMemo(() => distribution(complianceControlRows, 'control_category'), [complianceControlRows]);
  const complianceFindingSplit = useMemo(() => distribution(complianceFindingRows, 'finding_type'), [complianceFindingRows]);
  const lineOfBusinessThisMonth = useMemo(() => `${countThisMonth(lineOfBusinessRows, 'created_at')} this month`, [lineOfBusinessRows]);
  const userSplit = useMemo(() => distribution(userRows, 'role'), [userRows]);
  const claimNumericTotal = useMemo(() => sumBy(claimRows, 'total_billed_amount'), [claimRows]);
  const claimTrend = useMemo(() => monthlySeries(claimRows, 'created_at'), [claimRows]);
  const labTestOrderBreakdown = useMemo(() => groupByCount(labTestOrderRows, 'order_status'), [labTestOrderRows]);
  const claimRecent = useMemo(() => [...claimRows].slice(0, 5), [claimRows]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="relative isolate flex flex-col overflow-hidden rounded-xl bg-gradient-to-b from-brand-900 to-brand-700 px-7 py-8 lg:col-span-5">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-1 flex-col">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/50">Portal overview</p>
            <h2 className="mt-3 font-heading text-2xl font-semibold leading-snug tracking-tight text-white">Welcome to Lab Test Management Across Commercial</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/75">Lab Test Workbench streamlines lab test ordering, results tracking, and claims processing across Commercial and Medicare Advantage lines of business. It helps operations teams reduce claims errors by surfacing discrepancies between Facets and Epic, while ensuring PHI access stays compliant with HIPAA and HITRUST controls.</p>
            <div className="mt-auto pt-6">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-white/50">What you can do here</p>
              <ul className="space-y-2 text-sm leading-relaxed text-white/80">
                <li className="flex items-start gap-2.5">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 flex-none text-white/60" />
                  <span>Track lab orders from request through results</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 flex-none text-white/60" />
                  <span>Identify and resolve claims errors quickly</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 flex-none text-white/60" />
                  <span>Audit PHI access across all systems</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 flex-none text-white/60" />
                  <span>Monitor compliance controls and findings</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 flex-none text-white/60" />
                  <span>Review claims by status and denial reasons</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
        <div className="h-full lg:col-span-7">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 h-full auto-rows-fr">
        <StatCard label="Total Lab Test Orders" value={labTestOrderRows.length} icon={UsersIcon} to="/lab-test-orders" hint={labTestOrderSplit} />
        <StatCard label="Total Lab Test Lines" value={labTestLineRows.length} icon={DatabaseIcon} to="/lab-test-lines" hint={labTestLineSplit} />
        <StatCard label="Total Claims" value={claimRows.length} icon={LayersIcon} to="/claims" hint={claimSplit} />
        <StatCard label="Total Claim Lines" value={claimLineRows.length} icon={ClipboardListIcon} to="/claim-lines" hint={claimLineSplit} />
        <StatCard label="Total Claim Errors" value={claimErrorRows.length} icon={BoxesIcon} to="/claim-errors" hint={claimErrorSplit} />
        <StatCard label="Total Members" value={memberRows.length} icon={FileTextIcon} to="/members" hint={memberSplit} />
        <StatCard label="Total Providers" value={providerRows.length} icon={Building2Icon} to="/providers" hint={providerSplit} />
        <StatCard label="Total Phi Access Logs" value={phiAccessLogRows.length} icon={TagIcon} to="/phi-access-logs" hint={phiAccessLogSplit} />
        <StatCard label="Total Compliance Controls" value={complianceControlRows.length} icon={UsersIcon} to="/compliance-controls" hint={complianceControlSplit} />
        <StatCard label="Total Compliance Findings" value={complianceFindingRows.length} icon={DatabaseIcon} to="/compliance-findings" hint={complianceFindingSplit} />
        <StatCard label="Total Line Of Businesses" value={lineOfBusinessRows.length} icon={LayersIcon} to="/line-of-businesses" hint={lineOfBusinessThisMonth} />
        <StatCard label="Total Users" value={userRows.length} icon={ClipboardListIcon} to="/users" hint={userSplit} />
        <StatCard label="Total Billed Amount" value={claimNumericTotal.toLocaleString()} icon={TrendingUpIcon} accent="bg-emerald-50 text-emerald-600" />
      </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TrendChart title="Claim over time" subtitle="New claims per month" data={claimTrend} />
        <BreakdownChart title="Lab Test Order by Order Status" data={labTestOrderBreakdown} />
      </div>

      <div className="rounded-md border border-slate-200 bg-white">
        <div className="p-3.5 pb-0">
          <h3 className="text-sm font-semibold text-slate-900">Recent Claims</h3>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr>
              <th className="px-3 py-2.5 sm:px-4 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Claim Number</th>
              <th className="px-3 py-2.5 sm:px-4 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Claim Type</th>
              <th className="px-3 py-2.5 sm:px-4 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Created At</th>
              <th className="px-3 py-2.5 sm:px-4 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Total Billed Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {claimRecent.map((row) => (
                <tr key={String(row.claim_id)}>
                <td className="px-3 py-2.5 sm:px-4 text-sm text-slate-700">{formatCell(row.claim_number)}</td>
                <td className="px-3 py-2.5 sm:px-4 text-sm"><Badge label={String(row.claim_type ?? '—')} color={claimDashboardBadgeColorMap[String(row.claim_type)]} /></td>
                <td className="px-3 py-2.5 sm:px-4 text-sm text-slate-700">{formatCell(row.created_at)}</td>
                <td className="px-3 py-2.5 sm:px-4 text-sm text-slate-700">{formatCell(row.total_billed_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {claimRecent.length === 0 && (
            <p className="p-3.5 pt-0 text-sm text-slate-500">No data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
