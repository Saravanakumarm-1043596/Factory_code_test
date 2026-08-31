import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { FirewallRuleSetListPage } from './pages/FirewallRuleSetListPage';
import { FirewallRuleSetFormPage } from './pages/FirewallRuleSetFormPage';
import { FirewallRuleSetDetailPage } from './pages/FirewallRuleSetDetailPage';
import { FirewallRuleListPage } from './pages/FirewallRuleListPage';
import { FirewallRuleFormPage } from './pages/FirewallRuleFormPage';
import { FirewallRuleDetailPage } from './pages/FirewallRuleDetailPage';
import { RuleIssueListPage } from './pages/RuleIssueListPage';
import { RuleIssueFormPage } from './pages/RuleIssueFormPage';
import { RuleIssueDetailPage } from './pages/RuleIssueDetailPage';
import { ChangeRequestListPage } from './pages/ChangeRequestListPage';
import { ChangeRequestFormPage } from './pages/ChangeRequestFormPage';
import { ChangeRequestDetailPage } from './pages/ChangeRequestDetailPage';
import { AuditScanListPage } from './pages/AuditScanListPage';
import { AuditScanFormPage } from './pages/AuditScanFormPage';
import { AuditScanDetailPage } from './pages/AuditScanDetailPage';
import { ScanFindingListPage } from './pages/ScanFindingListPage';
import { ScanFindingFormPage } from './pages/ScanFindingFormPage';
import { ScanFindingDetailPage } from './pages/ScanFindingDetailPage';
import { ProtectedSystemListPage } from './pages/ProtectedSystemListPage';
import { ProtectedSystemFormPage } from './pages/ProtectedSystemFormPage';
import { ProtectedSystemDetailPage } from './pages/ProtectedSystemDetailPage';
import { NetworkSecurityGroupListPage } from './pages/NetworkSecurityGroupListPage';
import { NetworkSecurityGroupFormPage } from './pages/NetworkSecurityGroupFormPage';
import { NetworkSecurityGroupDetailPage } from './pages/NetworkSecurityGroupDetailPage';
import { ApplianceListPage } from './pages/ApplianceListPage';
import { ApplianceFormPage } from './pages/ApplianceFormPage';
import { ApplianceDetailPage } from './pages/ApplianceDetailPage';
import { ComplianceMappingListPage } from './pages/ComplianceMappingListPage';
import { ComplianceMappingFormPage } from './pages/ComplianceMappingFormPage';
import { ComplianceMappingDetailPage } from './pages/ComplianceMappingDetailPage';

const PROJECT_NAME = "acme-health-s-firewall-rule-sets-across";

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout projectName={PROJECT_NAME}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/firewall-rule-sets" element={<FirewallRuleSetListPage />} />
          <Route path="/firewall-rule-sets/new" element={<FirewallRuleSetFormPage />} />
          <Route path="/firewall-rule-sets/:id/edit" element={<FirewallRuleSetFormPage />} />
          <Route path="/firewall-rule-sets/:id" element={<FirewallRuleSetDetailPage />} />
          <Route path="/firewall-rules" element={<FirewallRuleListPage />} />
          <Route path="/firewall-rules/new" element={<FirewallRuleFormPage />} />
          <Route path="/firewall-rules/:id/edit" element={<FirewallRuleFormPage />} />
          <Route path="/firewall-rules/:id" element={<FirewallRuleDetailPage />} />
          <Route path="/rule-issues" element={<RuleIssueListPage />} />
          <Route path="/rule-issues/new" element={<RuleIssueFormPage />} />
          <Route path="/rule-issues/:id/edit" element={<RuleIssueFormPage />} />
          <Route path="/rule-issues/:id" element={<RuleIssueDetailPage />} />
          <Route path="/change-requests" element={<ChangeRequestListPage />} />
          <Route path="/change-requests/new" element={<ChangeRequestFormPage />} />
          <Route path="/change-requests/:id/edit" element={<ChangeRequestFormPage />} />
          <Route path="/change-requests/:id" element={<ChangeRequestDetailPage />} />
          <Route path="/audit-scans" element={<AuditScanListPage />} />
          <Route path="/audit-scans/new" element={<AuditScanFormPage />} />
          <Route path="/audit-scans/:id/edit" element={<AuditScanFormPage />} />
          <Route path="/audit-scans/:id" element={<AuditScanDetailPage />} />
          <Route path="/scan-findings" element={<ScanFindingListPage />} />
          <Route path="/scan-findings/new" element={<ScanFindingFormPage />} />
          <Route path="/scan-findings/:id/edit" element={<ScanFindingFormPage />} />
          <Route path="/scan-findings/:id" element={<ScanFindingDetailPage />} />
          <Route path="/protected-systems" element={<ProtectedSystemListPage />} />
          <Route path="/protected-systems/new" element={<ProtectedSystemFormPage />} />
          <Route path="/protected-systems/:id/edit" element={<ProtectedSystemFormPage />} />
          <Route path="/protected-systems/:id" element={<ProtectedSystemDetailPage />} />
          <Route path="/network-security-groups" element={<NetworkSecurityGroupListPage />} />
          <Route path="/network-security-groups/new" element={<NetworkSecurityGroupFormPage />} />
          <Route path="/network-security-groups/:id/edit" element={<NetworkSecurityGroupFormPage />} />
          <Route path="/network-security-groups/:id" element={<NetworkSecurityGroupDetailPage />} />
          <Route path="/appliances" element={<ApplianceListPage />} />
          <Route path="/appliances/new" element={<ApplianceFormPage />} />
          <Route path="/appliances/:id/edit" element={<ApplianceFormPage />} />
          <Route path="/appliances/:id" element={<ApplianceDetailPage />} />
          <Route path="/compliance-mappings" element={<ComplianceMappingListPage />} />
          <Route path="/compliance-mappings/new" element={<ComplianceMappingFormPage />} />
          <Route path="/compliance-mappings/:id/edit" element={<ComplianceMappingFormPage />} />
          <Route path="/compliance-mappings/:id" element={<ComplianceMappingDetailPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
