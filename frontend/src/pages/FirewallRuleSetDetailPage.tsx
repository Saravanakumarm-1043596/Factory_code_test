import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, Pencil as PencilIcon } from 'lucide-react';
import type { FirewallRuleSet } from '../types/FirewallRuleSet';
import type { NetworkSecurityGroup } from '../types/NetworkSecurityGroup';
import type { Appliance } from '../types/Appliance';
import type { ProtectedSystem } from '../types/ProtectedSystem';
import type { FirewallRule } from '../types/FirewallRule';
import type { ChangeRequest } from '../types/ChangeRequest';
import type { ComplianceMapping } from '../types/ComplianceMapping';
import { firewallRuleSetService } from '../services/FirewallRuleSetService';
import { networkSecurityGroupService } from '../services/NetworkSecurityGroupService';
import { applianceService } from '../services/ApplianceService';
import { protectedSystemService } from '../services/ProtectedSystemService';
import { firewallRuleService } from '../services/FirewallRuleService';
import { changeRequestService } from '../services/ChangeRequestService';
import { complianceMappingService } from '../services/ComplianceMappingService';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { formatCell } from '../lib/format';

export function FirewallRuleSetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<FirewallRuleSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [network_security_group_idTarget, setNetwork_security_group_idTarget] = useState<NetworkSecurityGroup | null>(null);
  const [appliance_idTarget, setAppliance_idTarget] = useState<Appliance | null>(null);
  const [protected_system_idTarget, setProtected_system_idTarget] = useState<ProtectedSystem | null>(null);
  const [firewallRuleLinkedRows, setFirewallRuleLinkedRows] = useState<FirewallRule[]>([]);
  const [changeRequestLinkedRows, setChangeRequestLinkedRows] = useState<ChangeRequest[]>([]);
  const [complianceMappingLinkedRows, setComplianceMappingLinkedRows] = useState<ComplianceMapping[]>([]);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await firewallRuleSetService.list();
      setRecord(rows.find((r) => String(r.firewall_rule_set_id) === String(id)) ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Firewall Rule Set');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [id]);

  useEffect(() => {
    const fkValue: unknown = record ? record.network_security_group_id : null;
    if (fkValue === null || fkValue === undefined || fkValue === '') {
      setNetwork_security_group_idTarget(null);
      return;
    }
    networkSecurityGroupService.getById(fkValue as string | number)
      .then((row) => setNetwork_security_group_idTarget(row ?? null))
      .catch(() => setNetwork_security_group_idTarget(null));
  }, [record]);

  useEffect(() => {
    const fkValue: unknown = record ? record.appliance_id : null;
    if (fkValue === null || fkValue === undefined || fkValue === '') {
      setAppliance_idTarget(null);
      return;
    }
    applianceService.getById(fkValue as string | number)
      .then((row) => setAppliance_idTarget(row ?? null))
      .catch(() => setAppliance_idTarget(null));
  }, [record]);

  useEffect(() => {
    const fkValue: unknown = record ? record.protected_system_id : null;
    if (fkValue === null || fkValue === undefined || fkValue === '') {
      setProtected_system_idTarget(null);
      return;
    }
    protectedSystemService.getById(fkValue as string | number)
      .then((row) => setProtected_system_idTarget(row ?? null))
      .catch(() => setProtected_system_idTarget(null));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    firewallRuleService.list()
      .then((rows) => setFirewallRuleLinkedRows(rows.filter((r) => String(r.firewall_rule_set_id) === String(record.firewall_rule_set_id))))
      .catch(() => setFirewallRuleLinkedRows([]));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    changeRequestService.list()
      .then((rows) => setChangeRequestLinkedRows(rows.filter((r) => String(r.firewall_rule_set_id) === String(record.firewall_rule_set_id))))
      .catch(() => setChangeRequestLinkedRows([]));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    complianceMappingService.list()
      .then((rows) => setComplianceMappingLinkedRows(rows.filter((r) => String(r.firewall_rule_set_id) === String(record.firewall_rule_set_id))))
      .catch(() => setComplianceMappingLinkedRows([]));
  }, [record]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white shadow-sm p-4" />;
  }

  if (!record) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 text-center text-sm text-slate-500">
        Firewall Rule Set not found.
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => navigate('/firewall-rule-sets')}>
            Back to Firewall Rule Sets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/firewall-rule-sets')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Firewall Rule Sets
        </button>
        <Button icon={<PencilIcon className="h-4 w-4" />} onClick={() => navigate('/firewall-rule-sets/' + id + '/edit')}>
          Edit
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <h1 className="text-lg font-semibold text-slate-900">{formatCell(record.name)}</h1>
        <p className="mt-1 text-sm text-slate-500">Firewall Rule Set details</p>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Firewall Rule Set Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.firewall_rule_set_id)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Name</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.name)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Description</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.description)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Network Security Group Id</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {network_security_group_idTarget ? (
                <Link to={`/network-security-groups/${record.network_security_group_id}`} className="text-brand-600 hover:underline">
                  {`${network_security_group_idTarget.name}`}
                </Link>
              ) : (
                formatCell(record.network_security_group_id)
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Appliance Id</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {appliance_idTarget ? (
                <Link to={`/appliances/${record.appliance_id}`} className="text-brand-600 hover:underline">
                  {`${appliance_idTarget.name}`}
                </Link>
              ) : (
                formatCell(record.appliance_id)
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Protected System Id</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {protected_system_idTarget ? (
                <Link to={`/protected-systems/${record.protected_system_id}`} className="text-brand-600 hover:underline">
                  {`${protected_system_idTarget.name}`}
                </Link>
              ) : (
                formatCell(record.protected_system_id)
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Rule Count</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.rule_count)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.status)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Last Reviewed At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.last_reviewed_at)}</dd>
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

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <h2 className="text-sm font-semibold text-slate-900">Firewall Rules</h2>
        {firewallRuleLinkedRows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No linked firewall rules.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {firewallRuleLinkedRows.map((row) => (
              <li key={String(row.firewall_rule_id)}>
                <Link to={`/firewall-rules/${row.firewall_rule_id}`} className="block py-2 text-sm text-brand-600 hover:underline">
                  {formatCell(row.rule_name)}
                </Link>
              </li>
            ))}
          </ul>
        )}
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
        <h2 className="text-sm font-semibold text-slate-900">Compliance Mappings</h2>
        {complianceMappingLinkedRows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No linked compliance mappings.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {complianceMappingLinkedRows.map((row) => (
              <li key={String(row.compliance_mapping_id)}>
                <Link to={`/compliance-mappings/${row.compliance_mapping_id}`} className="block py-2 text-sm text-brand-600 hover:underline">
                  {formatCell(row.control_name)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
