import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, Pencil as PencilIcon } from 'lucide-react';
import type { Appliance } from '../types/Appliance';
import type { FirewallRuleSet } from '../types/FirewallRuleSet';
import { applianceService } from '../services/ApplianceService';
import { firewallRuleSetService } from '../services/FirewallRuleSetService';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { formatCell } from '../lib/format';

export function ApplianceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<Appliance | null>(null);
  const [loading, setLoading] = useState(true);
  const [firewallRuleSetLinkedRows, setFirewallRuleSetLinkedRows] = useState<FirewallRuleSet[]>([]);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await applianceService.list();
      setRecord(rows.find((r) => String(r.appliance_id) === String(id)) ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Appliance');
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
      .then((rows) => setFirewallRuleSetLinkedRows(rows.filter((r) => String(r.appliance_id) === String(record.appliance_id))))
      .catch(() => setFirewallRuleSetLinkedRows([]));
  }, [record]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white shadow-sm p-4" />;
  }

  if (!record) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 text-center text-sm text-slate-500">
        Appliance not found.
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => navigate('/appliances')}>
            Back to Appliances
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/appliances')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Appliances
        </button>
        <Button icon={<PencilIcon className="h-4 w-4" />} onClick={() => navigate('/appliances/' + id + '/edit')}>
          Edit
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <h1 className="text-lg font-semibold text-slate-900">{formatCell(record.name)}</h1>
        <p className="mt-1 text-sm text-slate-500">Appliance details</p>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Appliance Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.appliance_id)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Name</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.name)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Appliance Type</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.appliance_type)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Ip Address</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.ip_address)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Hostname</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.hostname)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Environment</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.environment)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Firmware Version</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.firmware_version)}</dd>
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
