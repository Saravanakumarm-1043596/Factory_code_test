import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { LabTestOrderListPage } from './pages/LabTestOrderListPage';
import { LabTestOrderFormPage } from './pages/LabTestOrderFormPage';
import { LabTestOrderDetailPage } from './pages/LabTestOrderDetailPage';
import { LabTestLineListPage } from './pages/LabTestLineListPage';
import { LabTestLineFormPage } from './pages/LabTestLineFormPage';
import { LabTestLineDetailPage } from './pages/LabTestLineDetailPage';
import { ClaimListPage } from './pages/ClaimListPage';
import { ClaimFormPage } from './pages/ClaimFormPage';
import { ClaimDetailPage } from './pages/ClaimDetailPage';
import { ClaimLineListPage } from './pages/ClaimLineListPage';
import { ClaimLineFormPage } from './pages/ClaimLineFormPage';
import { ClaimLineDetailPage } from './pages/ClaimLineDetailPage';
import { ClaimErrorListPage } from './pages/ClaimErrorListPage';
import { ClaimErrorFormPage } from './pages/ClaimErrorFormPage';
import { ClaimErrorDetailPage } from './pages/ClaimErrorDetailPage';
import { MemberListPage } from './pages/MemberListPage';
import { MemberFormPage } from './pages/MemberFormPage';
import { MemberDetailPage } from './pages/MemberDetailPage';
import { ProviderListPage } from './pages/ProviderListPage';
import { ProviderFormPage } from './pages/ProviderFormPage';
import { ProviderDetailPage } from './pages/ProviderDetailPage';
import { PhiAccessLogListPage } from './pages/PhiAccessLogListPage';
import { PhiAccessLogFormPage } from './pages/PhiAccessLogFormPage';
import { PhiAccessLogDetailPage } from './pages/PhiAccessLogDetailPage';
import { ComplianceControlListPage } from './pages/ComplianceControlListPage';
import { ComplianceControlFormPage } from './pages/ComplianceControlFormPage';
import { ComplianceControlDetailPage } from './pages/ComplianceControlDetailPage';
import { ComplianceFindingListPage } from './pages/ComplianceFindingListPage';
import { ComplianceFindingFormPage } from './pages/ComplianceFindingFormPage';
import { ComplianceFindingDetailPage } from './pages/ComplianceFindingDetailPage';
import { LineOfBusinessListPage } from './pages/LineOfBusinessListPage';
import { LineOfBusinessFormPage } from './pages/LineOfBusinessFormPage';
import { LineOfBusinessDetailPage } from './pages/LineOfBusinessDetailPage';
import { UserListPage } from './pages/UserListPage';
import { UserFormPage } from './pages/UserFormPage';
import { UserDetailPage } from './pages/UserDetailPage';

const PROJECT_NAME = "lab-test-management-across-commercial";

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout projectName={PROJECT_NAME}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lab-test-orders" element={<LabTestOrderListPage />} />
          <Route path="/lab-test-orders/new" element={<LabTestOrderFormPage />} />
          <Route path="/lab-test-orders/:id/edit" element={<LabTestOrderFormPage />} />
          <Route path="/lab-test-orders/:id" element={<LabTestOrderDetailPage />} />
          <Route path="/lab-test-lines" element={<LabTestLineListPage />} />
          <Route path="/lab-test-lines/new" element={<LabTestLineFormPage />} />
          <Route path="/lab-test-lines/:id/edit" element={<LabTestLineFormPage />} />
          <Route path="/lab-test-lines/:id" element={<LabTestLineDetailPage />} />
          <Route path="/claims" element={<ClaimListPage />} />
          <Route path="/claims/new" element={<ClaimFormPage />} />
          <Route path="/claims/:id/edit" element={<ClaimFormPage />} />
          <Route path="/claims/:id" element={<ClaimDetailPage />} />
          <Route path="/claim-lines" element={<ClaimLineListPage />} />
          <Route path="/claim-lines/new" element={<ClaimLineFormPage />} />
          <Route path="/claim-lines/:id/edit" element={<ClaimLineFormPage />} />
          <Route path="/claim-lines/:id" element={<ClaimLineDetailPage />} />
          <Route path="/claim-errors" element={<ClaimErrorListPage />} />
          <Route path="/claim-errors/new" element={<ClaimErrorFormPage />} />
          <Route path="/claim-errors/:id/edit" element={<ClaimErrorFormPage />} />
          <Route path="/claim-errors/:id" element={<ClaimErrorDetailPage />} />
          <Route path="/members" element={<MemberListPage />} />
          <Route path="/members/new" element={<MemberFormPage />} />
          <Route path="/members/:id/edit" element={<MemberFormPage />} />
          <Route path="/members/:id" element={<MemberDetailPage />} />
          <Route path="/providers" element={<ProviderListPage />} />
          <Route path="/providers/new" element={<ProviderFormPage />} />
          <Route path="/providers/:id/edit" element={<ProviderFormPage />} />
          <Route path="/providers/:id" element={<ProviderDetailPage />} />
          <Route path="/phi-access-logs" element={<PhiAccessLogListPage />} />
          <Route path="/phi-access-logs/new" element={<PhiAccessLogFormPage />} />
          <Route path="/phi-access-logs/:id/edit" element={<PhiAccessLogFormPage />} />
          <Route path="/phi-access-logs/:id" element={<PhiAccessLogDetailPage />} />
          <Route path="/compliance-controls" element={<ComplianceControlListPage />} />
          <Route path="/compliance-controls/new" element={<ComplianceControlFormPage />} />
          <Route path="/compliance-controls/:id/edit" element={<ComplianceControlFormPage />} />
          <Route path="/compliance-controls/:id" element={<ComplianceControlDetailPage />} />
          <Route path="/compliance-findings" element={<ComplianceFindingListPage />} />
          <Route path="/compliance-findings/new" element={<ComplianceFindingFormPage />} />
          <Route path="/compliance-findings/:id/edit" element={<ComplianceFindingFormPage />} />
          <Route path="/compliance-findings/:id" element={<ComplianceFindingDetailPage />} />
          <Route path="/line-of-businesses" element={<LineOfBusinessListPage />} />
          <Route path="/line-of-businesses/new" element={<LineOfBusinessFormPage />} />
          <Route path="/line-of-businesses/:id/edit" element={<LineOfBusinessFormPage />} />
          <Route path="/line-of-businesses/:id" element={<LineOfBusinessDetailPage />} />
          <Route path="/users" element={<UserListPage />} />
          <Route path="/users/new" element={<UserFormPage />} />
          <Route path="/users/:id/edit" element={<UserFormPage />} />
          <Route path="/users/:id" element={<UserDetailPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
