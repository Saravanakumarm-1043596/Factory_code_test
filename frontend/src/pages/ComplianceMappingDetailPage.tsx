import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, Pencil as PencilIcon, Download as DownloadIcon } from 'lucide-react';
import type { ComplianceMapping } from '../types/ComplianceMapping';
import type { ProtectedSystem } from '../types/ProtectedSystem';
import type { FirewallRuleSet } from '../types/FirewallRuleSet';
import { complianceMappingService } from '../services/ComplianceMappingService';
import { protectedSystemService } from '../services/ProtectedSystemService';
import { firewallRuleSetService } from '../services/FirewallRuleSetService';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { formatCell } from '../lib/format';

export function ComplianceMappingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<ComplianceMapping | null>(null);
  const [loading, setLoading] = useState(true);
  const [protected_system_idTarget, setProtected_system_idTarget] = useState<ProtectedSystem | null>(null);
  const [firewall_rule_set_idTarget, setFirewall_rule_set_idTarget] = useState<FirewallRuleSet | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await complianceMappingService.list();
      setRecord(rows.find((r) => String(r.compliance_mapping_id) === String(id)) ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Compliance Mapping');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [id]);

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
    const fkValue: unknown = record ? record.firewall_rule_set_id : null;
    if (fkValue === null || fkValue === undefined || fkValue === '') {
      setFirewall_rule_set_idTarget(null);
      return;
    }
    firewallRuleSetService.getById(fkValue as string | number)
      .then((row) => setFirewall_rule_set_idTarget(row ?? null))
      .catch(() => setFirewall_rule_set_idTarget(null));
  }, [record]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white shadow-sm p-4" />;
  }

  if (!record) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 text-center text-sm text-slate-500">
        Compliance Mapping not found.
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => navigate('/compliance-mappings')}>
            Back to Compliance Mappings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/compliance-mappings')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Compliance Mappings
        </button>
        <Button icon={<PencilIcon className="h-4 w-4" />} onClick={() => navigate('/compliance-mappings/' + id + '/edit')}>
          Edit
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <h1 className="text-lg font-semibold text-slate-900">{formatCell(record.control_name)}</h1>
        <p className="mt-1 text-sm text-slate-500">Compliance Mapping details</p>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Compliance Mapping Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.compliance_mapping_id)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Framework</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.framework)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Control Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.control_id)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Control Name</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.control_name)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Description</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.description)}</dd>
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
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Compliance Status</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.compliance_status)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Evidence File</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {record.evidence_file ? (
                <a href={String(record.evidence_file)} download className="inline-flex items-center gap-1 text-brand-600 hover:underline">
                  <DownloadIcon className="h-3.5 w-3.5" /> Download
                </a>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Last Assessed At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.last_assessed_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Assessor</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.assessor)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Notes</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.notes)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
