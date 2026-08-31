import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, Pencil as PencilIcon } from 'lucide-react';
import type { NetworkSecurityGroup } from '../types/NetworkSecurityGroup';
import type { FirewallRuleSet } from '../types/FirewallRuleSet';
import { networkSecurityGroupService } from '../services/NetworkSecurityGroupService';
import { firewallRuleSetService } from '../services/FirewallRuleSetService';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { formatCell } from '../lib/format';

export function NetworkSecurityGroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<NetworkSecurityGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [firewallRuleSetLinkedRows, setFirewallRuleSetLinkedRows] = useState<FirewallRuleSet[]>([]);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await networkSecurityGroupService.list();
      setRecord(rows.find((r) => String(r.network_security_group_id) === String(id)) ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Network Security Group');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [id]);

  useEffect(() => {
    if (!record) return;
    firewallRuleSetService.list()
      .then((rows) => setFirewallRuleSetLinkedRows(rows.filter((r) => String(r.network_security_group_id) === String(record.network_security_group_id))))
      .catch(() => setFirewallRuleSetLinkedRows([]));
  }, [record]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white shadow-sm p-4" />;
  }

  if (!record) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 text-center text-sm text-slate-500">
        Network Security Group not found.
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => navigate('/network-security-groups')}>
            Back to Network Security Groups
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/network-security-groups')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Network Security Groups
        </button>
        <Button icon={<PencilIcon className="h-4 w-4" />} onClick={() => navigate('/network-security-groups/' + id + '/edit')}>
          Edit
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <h1 className="text-lg font-semibold text-slate-900">{formatCell(record.name)}</h1>
        <p className="mt-1 text-sm text-slate-500">Network Security Group details</p>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Network Security Group Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.network_security_group_id)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Name</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.name)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Azure Resource Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.azure_resource_id)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Subscription</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.subscription)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Resource Group</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.resource_group)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Region</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.region)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Associated Subnet</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.associated_subnet)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Associated Nic</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.associated_nic)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Rule Count</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.total_rule_count)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Last Synced At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.last_synced_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Notes</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.notes)}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <h2 className="text-sm font-semibold text-slate-900">Firewall Rule Sets</h2>
        {firewallRuleSetLinkedRows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No linked firewall rule sets.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {firewallRuleSetLinkedRows.map((row) => (
              <li key={String(row.firewall_rule_set_id)}>
                <Link to={`/firewall-rule-sets/${row.firewall_rule_set_id}`} className="block py-2 text-sm text-brand-600 hover:underline">
                  {formatCell(row.name)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
