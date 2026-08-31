import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { AppointmentListPage } from './pages/AppointmentListPage';
import { AppointmentFormPage } from './pages/AppointmentFormPage';
import { AppointmentDetailPage } from './pages/AppointmentDetailPage';
import { PatientListPage } from './pages/PatientListPage';
import { PatientFormPage } from './pages/PatientFormPage';
import { PatientDetailPage } from './pages/PatientDetailPage';
import { ScheduleSlotListPage } from './pages/ScheduleSlotListPage';
import { ScheduleSlotFormPage } from './pages/ScheduleSlotFormPage';
import { ScheduleSlotDetailPage } from './pages/ScheduleSlotDetailPage';
import { PatientEngagementListPage } from './pages/PatientEngagementListPage';
import { PatientEngagementFormPage } from './pages/PatientEngagementFormPage';
import { PatientEngagementDetailPage } from './pages/PatientEngagementDetailPage';
import { ClinicianListPage } from './pages/ClinicianListPage';
import { ClinicianFormPage } from './pages/ClinicianFormPage';
import { ClinicianDetailPage } from './pages/ClinicianDetailPage';
import { FacilityListPage } from './pages/FacilityListPage';
import { FacilityFormPage } from './pages/FacilityFormPage';
import { FacilityDetailPage } from './pages/FacilityDetailPage';
import { PredictiveModelListPage } from './pages/PredictiveModelListPage';
import { PredictiveModelFormPage } from './pages/PredictiveModelFormPage';
import { PredictiveModelDetailPage } from './pages/PredictiveModelDetailPage';
import { BreachIncidentListPage } from './pages/BreachIncidentListPage';
import { BreachIncidentFormPage } from './pages/BreachIncidentFormPage';
import { BreachIncidentDetailPage } from './pages/BreachIncidentDetailPage';
import { PhiaccessLogListPage } from './pages/PhiaccessLogListPage';
import { PhiaccessLogFormPage } from './pages/PhiaccessLogFormPage';
import { PhiaccessLogDetailPage } from './pages/PhiaccessLogDetailPage';
import { ConsentRecordListPage } from './pages/ConsentRecordListPage';
import { ConsentRecordFormPage } from './pages/ConsentRecordFormPage';
import { ConsentRecordDetailPage } from './pages/ConsentRecordDetailPage';
import { EhrintegrationEventListPage } from './pages/EhrintegrationEventListPage';
import { EhrintegrationEventFormPage } from './pages/EhrintegrationEventFormPage';
import { EhrintegrationEventDetailPage } from './pages/EhrintegrationEventDetailPage';
import { AppUserListPage } from './pages/AppUserListPage';
import { AppUserFormPage } from './pages/AppUserFormPage';
import { AppUserDetailPage } from './pages/AppUserDetailPage';

const PROJECT_NAME = "horizon-care-network-s-850k-patient";

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout projectName={PROJECT_NAME}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/appointments" element={<AppointmentListPage />} />
          <Route path="/appointments/new" element={<AppointmentFormPage />} />
          <Route path="/appointments/:id/edit" element={<AppointmentFormPage />} />
          <Route path="/appointments/:id" element={<AppointmentDetailPage />} />
          <Route path="/patients" element={<PatientListPage />} />
          <Route path="/patients/new" element={<PatientFormPage />} />
          <Route path="/patients/:id/edit" element={<PatientFormPage />} />
          <Route path="/patients/:id" element={<PatientDetailPage />} />
          <Route path="/schedule-slots" element={<ScheduleSlotListPage />} />
          <Route path="/schedule-slots/new" element={<ScheduleSlotFormPage />} />
          <Route path="/schedule-slots/:id/edit" element={<ScheduleSlotFormPage />} />
          <Route path="/schedule-slots/:id" element={<ScheduleSlotDetailPage />} />
          <Route path="/patient-engagements" element={<PatientEngagementListPage />} />
          <Route path="/patient-engagements/new" element={<PatientEngagementFormPage />} />
          <Route path="/patient-engagements/:id/edit" element={<PatientEngagementFormPage />} />
          <Route path="/patient-engagements/:id" element={<PatientEngagementDetailPage />} />
          <Route path="/clinicians" element={<ClinicianListPage />} />
          <Route path="/clinicians/new" element={<ClinicianFormPage />} />
          <Route path="/clinicians/:id/edit" element={<ClinicianFormPage />} />
          <Route path="/clinicians/:id" element={<ClinicianDetailPage />} />
          <Route path="/facilities" element={<FacilityListPage />} />
          <Route path="/facilities/new" element={<FacilityFormPage />} />
          <Route path="/facilities/:id/edit" element={<FacilityFormPage />} />
          <Route path="/facilities/:id" element={<FacilityDetailPage />} />
          <Route path="/predictive-models" element={<PredictiveModelListPage />} />
          <Route path="/predictive-models/new" element={<PredictiveModelFormPage />} />
          <Route path="/predictive-models/:id/edit" element={<PredictiveModelFormPage />} />
          <Route path="/predictive-models/:id" element={<PredictiveModelDetailPage />} />
          <Route path="/breach-incidents" element={<BreachIncidentListPage />} />
          <Route path="/breach-incidents/new" element={<BreachIncidentFormPage />} />
          <Route path="/breach-incidents/:id/edit" element={<BreachIncidentFormPage />} />
          <Route path="/breach-incidents/:id" element={<BreachIncidentDetailPage />} />
          <Route path="/phiaccess-logs" element={<PhiaccessLogListPage />} />
          <Route path="/phiaccess-logs/new" element={<PhiaccessLogFormPage />} />
          <Route path="/phiaccess-logs/:id/edit" element={<PhiaccessLogFormPage />} />
          <Route path="/phiaccess-logs/:id" element={<PhiaccessLogDetailPage />} />
          <Route path="/consent-records" element={<ConsentRecordListPage />} />
          <Route path="/consent-records/new" element={<ConsentRecordFormPage />} />
          <Route path="/consent-records/:id/edit" element={<ConsentRecordFormPage />} />
          <Route path="/consent-records/:id" element={<ConsentRecordDetailPage />} />
          <Route path="/ehrintegration-events" element={<EhrintegrationEventListPage />} />
          <Route path="/ehrintegration-events/new" element={<EhrintegrationEventFormPage />} />
          <Route path="/ehrintegration-events/:id/edit" element={<EhrintegrationEventFormPage />} />
          <Route path="/ehrintegration-events/:id" element={<EhrintegrationEventDetailPage />} />
          <Route path="/app-users" element={<AppUserListPage />} />
          <Route path="/app-users/new" element={<AppUserFormPage />} />
          <Route path="/app-users/:id/edit" element={<AppUserFormPage />} />
          <Route path="/app-users/:id" element={<AppUserDetailPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
