import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, Pencil as PencilIcon } from 'lucide-react';
import type { Clinician } from '../types/Clinician';
import type { Facility } from '../types/Facility';
import type { Appointment } from '../types/Appointment';
import type { ScheduleSlot } from '../types/ScheduleSlot';
import type { AppUser } from '../types/AppUser';
import { clinicianService } from '../services/ClinicianService';
import { facilityService } from '../services/FacilityService';
import { appointmentService } from '../services/AppointmentService';
import { scheduleSlotService } from '../services/ScheduleSlotService';
import { appUserService } from '../services/AppUserService';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { formatCell } from '../lib/format';

export function ClinicianDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<Clinician | null>(null);
  const [loading, setLoading] = useState(true);
  const [facility_idTarget, setFacility_idTarget] = useState<Facility | null>(null);
  const [appointmentLinkedRows, setAppointmentLinkedRows] = useState<Appointment[]>([]);
  const [scheduleSlotLinkedRows, setScheduleSlotLinkedRows] = useState<ScheduleSlot[]>([]);
  const [appUserLinkedRows, setAppUserLinkedRows] = useState<AppUser[]>([]);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await clinicianService.list();
      setRecord(rows.find((r) => String(r.clinician_id) === String(id)) ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Clinician');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [id]);

  useEffect(() => {
    const fkValue: unknown = record ? record.facility_id : null;
    if (fkValue === null || fkValue === undefined || fkValue === '') {
      setFacility_idTarget(null);
      return;
    }
    facilityService.getById(fkValue as string | number)
      .then((row) => setFacility_idTarget(row ?? null))
      .catch(() => setFacility_idTarget(null));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    appointmentService.list()
      .then((rows) => setAppointmentLinkedRows(rows.filter((r) => String(r.clinician_id) === String(record.clinician_id))))
      .catch(() => setAppointmentLinkedRows([]));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    scheduleSlotService.list()
      .then((rows) => setScheduleSlotLinkedRows(rows.filter((r) => String(r.clinician_id) === String(record.clinician_id))))
      .catch(() => setScheduleSlotLinkedRows([]));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    appUserService.list()
      .then((rows) => setAppUserLinkedRows(rows.filter((r) => String(r.clinician_id) === String(record.clinician_id))))
      .catch(() => setAppUserLinkedRows([]));
  }, [record]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-md border border-slate-200 bg-white p-3.5" />;
  }

  if (!record) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-3.5 text-center text-sm text-slate-500">
        Clinician not found.
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => navigate('/clinicians')}>
            Back to Clinicians
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/clinicians')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Clinicians
        </button>
        <Button icon={<PencilIcon className="h-4 w-4" />} onClick={() => navigate('/clinicians/' + id + '/edit')}>
          Edit
        </Button>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h1 className="text-lg font-semibold text-slate-900">{formatCell(record.first_name)}</h1>
        <p className="mt-1 text-sm text-slate-500">Clinician details</p>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Clinician Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.clinician_id)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">First Name</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.first_name)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Last Name</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.last_name)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.email)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Npi Number</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.npi_number)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Specialty</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.specialty)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Ehr Source System</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.ehr_source_system)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Facility Id</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {facility_idTarget ? (
                <Link to={`/facilities/${record.facility_id}`} className="text-brand-600 hover:underline">
                  {`${facility_idTarget.name}`}
                </Link>
              ) : (
                formatCell(record.facility_id)
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.status)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Max Daily Appointments</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.max_daily_appointments)}</dd>
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

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h2 className="text-sm font-semibold text-slate-900">Appointments</h2>
        {appointmentLinkedRows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No linked appointments.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {appointmentLinkedRows.map((row) => (
              <li key={String(row.appointment_id)}>
                <Link to={`/appointments/${row.appointment_id}`} className="block py-2 text-sm text-brand-600 hover:underline">
                  {formatCell(row.appointment_id)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h2 className="text-sm font-semibold text-slate-900">Schedule Slots</h2>
        {scheduleSlotLinkedRows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No linked schedule slots.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {scheduleSlotLinkedRows.map((row) => (
              <li key={String(row.schedule_slot_id)}>
                <Link to={`/schedule-slots/${row.schedule_slot_id}`} className="block py-2 text-sm text-brand-600 hover:underline">
                  {formatCell(row.schedule_slot_id)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h2 className="text-sm font-semibold text-slate-900">App Users</h2>
        {appUserLinkedRows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No linked app users.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {appUserLinkedRows.map((row) => (
              <li key={String(row.app_user_id)}>
                <Link to={`/app-users/${row.app_user_id}`} className="block py-2 text-sm text-brand-600 hover:underline">
                  {formatCell(row.first_name)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
