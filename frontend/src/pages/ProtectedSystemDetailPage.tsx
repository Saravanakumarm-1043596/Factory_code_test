import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, Pencil as PencilIcon } from 'lucide-react';
import type { ProtectedSystem } from '../types/ProtectedSystem';
import type { FirewallRuleSet } from '../types/FirewallRuleSet';
import type { ComplianceMapping } from '../types/ComplianceMapping';
import { protectedSystemService } from '../services/ProtectedSystemService';
import { firewallRuleSetService } from '../services/FirewallRuleSetService';
import { complianceMappingService } from '../services/ComplianceMappingService';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { formatCell } from '../lib/format';

export function ProtectedSystemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<ProtectedSystem | null>(null);
  const [loading, setLoading] = useState(true);
  const [firewallRuleSetLinkedRows, setFirewallRuleSetLinkedRows] = useState<FirewallRuleSet[]>([]);
  const [complianceMappingLinkedRows, setComplianceMappingLinkedRows] = useState<ComplianceMapping[]>([]);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await protectedSystemService.list();
      setRecord(rows.find((r) => String(r.protected_system_id) === String(id)) ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Protected System');
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
      .then((rows) => setFirewallRuleSetLinkedRows(rows.filter((r) => String(r.protected_system_id) === String(record.protected_system_id))))
      .catch(() => setFirewallRuleSetLinkedRows([]));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    complianceMappingService.list()
      .then((rows) => setComplianceMappingLinkedRows(rows.filter((r) => String(r.protected_system_id) === String(record.protected_system_id))))
      .catch(() => setComplianceMappingLinkedRows([]));
  }, [record]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white shadow-sm p-4" />;
  }

  if (!record) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 text-center text-sm text-slate-500">
        Protected System not found.
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => navigate('/protected-systems')}>
            Back to Protected Systems
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/protected-systems')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Protected Systems
        </button>
        <Button icon={<PencilIcon className="h-4 w-4" />} onClick={() => navigate('/protected-systems/' + id + '/edit')}>
          Edit
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <h1 className="text-lg font-semibold text-slate-900">{formatCell(record.name)}</h1>
        <p className="mt-1 text-sm text-slate-500">Protected System details</p>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Protected System Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.protected_system_id)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Name</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.name)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">System Type</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.system_type)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Environment</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.environment)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Contains Phi</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.contains_phi)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Data Classification</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.data_classification)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Owner</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.owner)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Ip Range</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.ip_range)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Compliance Scope</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.compliance_scope)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Last Assessment Date</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.last_assessment_date)}</dd>
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
