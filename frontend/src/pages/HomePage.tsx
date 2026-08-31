import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users as UsersIcon, Database as DatabaseIcon, Layers as LayersIcon, ClipboardList as ClipboardListIcon, Boxes as BoxesIcon, FileText as FileTextIcon, Building2 as Building2Icon, Tag as TagIcon, TrendingUp as TrendingUpIcon, Check as CheckIcon } from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { sumBy, monthlySeries, groupByCount } from '../lib/aggregate';
import { TrendChart } from '../components/ui/TrendChart';
import { BreakdownChart } from '../components/ui/BreakdownChart';
import { Badge } from '../components/ui/Badge';
import { formatCell } from '../lib/format';
import type { Appointment } from '../types/Appointment';
import type { Patient } from '../types/Patient';
import type { ScheduleSlot } from '../types/ScheduleSlot';
import type { PatientEngagement } from '../types/PatientEngagement';
import type { Clinician } from '../types/Clinician';
import type { Facility } from '../types/Facility';
import type { PredictiveModel } from '../types/PredictiveModel';
import type { BreachIncident } from '../types/BreachIncident';
import type { PhiaccessLog } from '../types/PhiaccessLog';
import type { ConsentRecord } from '../types/ConsentRecord';
import type { EhrintegrationEvent } from '../types/EhrintegrationEvent';
import type { AppUser } from '../types/AppUser';
import { appointmentService } from '../services/AppointmentService';
import { patientService } from '../services/PatientService';
import { scheduleSlotService } from '../services/ScheduleSlotService';
import { patientEngagementService } from '../services/PatientEngagementService';
import { clinicianService } from '../services/ClinicianService';
import { facilityService } from '../services/FacilityService';
import { predictiveModelService } from '../services/PredictiveModelService';
import { breachIncidentService } from '../services/BreachIncidentService';
import { phiaccessLogService } from '../services/PhiaccessLogService';
import { consentRecordService } from '../services/ConsentRecordService';
import { ehrintegrationEventService } from '../services/EhrintegrationEventService';
import { appUserService } from '../services/AppUserService';

const appointmentDashboardBadgeColorMap: Record<string, string> = {
  'In-Person': 'indigo',
  'Telehealth': 'emerald',
  'Phone': 'amber',
  'Home Visit': 'rose',
};

export function HomePage() {
  const [appointmentRows, setAppointmentRows] = useState<Appointment[]>([]);
  const [patientRows, setPatientRows] = useState<Patient[]>([]);
  const [scheduleSlotRows, setScheduleSlotRows] = useState<ScheduleSlot[]>([]);
  const [patientEngagementRows, setPatientEngagementRows] = useState<PatientEngagement[]>([]);
  const [clinicianRows, setClinicianRows] = useState<Clinician[]>([]);
  const [facilityRows, setFacilityRows] = useState<Facility[]>([]);
  const [predictiveModelRows, setPredictiveModelRows] = useState<PredictiveModel[]>([]);
  const [breachIncidentRows, setBreachIncidentRows] = useState<BreachIncident[]>([]);
  const [phiaccessLogRows, setPhiaccessLogRows] = useState<PhiaccessLog[]>([]);
  const [consentRecordRows, setConsentRecordRows] = useState<ConsentRecord[]>([]);
  const [ehrintegrationEventRows, setEhrintegrationEventRows] = useState<EhrintegrationEvent[]>([]);
  const [appUserRows, setAppUserRows] = useState<AppUser[]>([]);

  useEffect(() => {
    appointmentService.list().then(setAppointmentRows);
    patientService.list().then(setPatientRows);
    scheduleSlotService.list().then(setScheduleSlotRows);
    patientEngagementService.list().then(setPatientEngagementRows);
    clinicianService.list().then(setClinicianRows);
    facilityService.list().then(setFacilityRows);
    predictiveModelService.list().then(setPredictiveModelRows);
    breachIncidentService.list().then(setBreachIncidentRows);
    phiaccessLogService.list().then(setPhiaccessLogRows);
    consentRecordService.list().then(setConsentRecordRows);
    ehrintegrationEventService.list().then(setEhrintegrationEventRows);
    appUserService.list().then(setAppUserRows);
  }, []);

  const appointmentNumericTotal = useMemo(() => sumBy(appointmentRows, 'duration_minutes'), [appointmentRows]);
  const appointmentTrend = useMemo(() => monthlySeries(appointmentRows, 'created_at'), [appointmentRows]);
  const appointmentBreakdown = useMemo(() => groupByCount(appointmentRows, 'appointment_type'), [appointmentRows]);
  const appointmentRecent = useMemo(() => [...appointmentRows].slice(0, 5), [appointmentRows]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="relative isolate flex flex-col overflow-hidden rounded-xl bg-gradient-to-b from-brand-900 to-brand-700 px-7 py-8 lg:col-span-5">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-1 flex-col">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/50">Portal overview</p>
            <h2 className="mt-3 font-heading text-2xl font-semibold leading-snug tracking-tight text-white">Welcome to Horizon Care Network S 850k Patient</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/75">Horizon Care Network helps scheduling coordinators and clinical staff reduce no-show rates and administrative burden across 850K patients. It combines predictive optimization with automated patient engagement to fill appointment slots intelligently, while enforcing HIPAA access controls and breach-notification compliance at every step.</p>
            <div className="mt-auto pt-6">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-white/50">What you can do here</p>
              <ul className="space-y-2 text-sm leading-relaxed text-white/80">
                <li className="flex items-start gap-2.5">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 flex-none text-white/60" />
                  <span>Schedule and optimize patient appointments</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 flex-none text-white/60" />
                  <span>Send automated reminders and track responses</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 flex-none text-white/60" />
                  <span>Assess no-show risk for upcoming visits</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 flex-none text-white/60" />
                  <span>Investigate and report PHI breach incidents</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 flex-none text-white/60" />
                  <span>Monitor EHR integration health across systems</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
        <div className="h-full lg:col-span-7">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 h-full auto-rows-fr">
        <StatCard label="Total Appointments" value={appointmentRows.length} icon={UsersIcon} to="/appointments" />
        <StatCard label="Total Patients" value={patientRows.length} icon={DatabaseIcon} to="/patients" />
        <StatCard label="Total Schedule Slots" value={scheduleSlotRows.length} icon={LayersIcon} to="/schedule-slots" />
        <StatCard label="Total Patient Engagements" value={patientEngagementRows.length} icon={ClipboardListIcon} to="/patient-engagements" />
        <StatCard label="Total Clinicians" value={clinicianRows.length} icon={BoxesIcon} to="/clinicians" />
        <StatCard label="Total Facilities" value={facilityRows.length} icon={FileTextIcon} to="/facilities" />
        <StatCard label="Total Predictive Models" value={predictiveModelRows.length} icon={Building2Icon} to="/predictive-models" />
        <StatCard label="Total Breach Incidents" value={breachIncidentRows.length} icon={TagIcon} to="/breach-incidents" />
        <StatCard label="Total Phiaccess Logs" value={phiaccessLogRows.length} icon={UsersIcon} to="/phiaccess-logs" />
        <StatCard label="Total Consent Records" value={consentRecordRows.length} icon={DatabaseIcon} to="/consent-records" />
        <StatCard label="Total Ehrintegration Events" value={ehrintegrationEventRows.length} icon={LayersIcon} to="/ehrintegration-events" />
        <StatCard label="Total App Users" value={appUserRows.length} icon={ClipboardListIcon} to="/app-users" />
        <StatCard label="Total Duration Minutes" value={appointmentNumericTotal.toLocaleString()} icon={TrendingUpIcon} accent="bg-emerald-50 text-emerald-600" />
      </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TrendChart title="Appointment over time" subtitle="New appointments per month" data={appointmentTrend} />
        <BreakdownChart title="Appointment by Appointment Type" data={appointmentBreakdown} />
      </div>

      <div className="rounded-md border border-slate-200 bg-white">
        <div className="p-3.5 pb-0">
          <h3 className="text-sm font-semibold text-slate-900">Recent Appointments</h3>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr>
              <th className="px-3 py-2.5 sm:px-4 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Appointment Type</th>
              <th className="px-3 py-2.5 sm:px-4 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Created At</th>
              <th className="px-3 py-2.5 sm:px-4 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Duration Minutes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointmentRecent.map((row) => (
                <tr key={String(row.appointment_id)}>
                <td className="px-3 py-2.5 sm:px-4 text-sm"><Badge label={String(row.appointment_type ?? '—')} color={appointmentDashboardBadgeColorMap[String(row.appointment_type)]} /></td>
                <td className="px-3 py-2.5 sm:px-4 text-sm text-slate-700">{formatCell(row.created_at)}</td>
                <td className="px-3 py-2.5 sm:px-4 text-sm text-slate-700">{formatCell(row.duration_minutes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {appointmentRecent.length === 0 && (
            <p className="p-3.5 pt-0 text-sm text-slate-500">No data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
