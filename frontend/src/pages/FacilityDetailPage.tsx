import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, Pencil as PencilIcon } from 'lucide-react';
import type { Facility } from '../types/Facility';
import type { Appointment } from '../types/Appointment';
import type { ScheduleSlot } from '../types/ScheduleSlot';
import type { Clinician } from '../types/Clinician';
import type { AppUser } from '../types/AppUser';
import { facilityService } from '../services/FacilityService';
import { appointmentService } from '../services/AppointmentService';
import { scheduleSlotService } from '../services/ScheduleSlotService';
import { clinicianService } from '../services/ClinicianService';
import { appUserService } from '../services/AppUserService';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { formatCell } from '../lib/format';

export function FacilityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const [appointmentLinkedRows, setAppointmentLinkedRows] = useState<Appointment[]>([]);
  const [scheduleSlotLinkedRows, setScheduleSlotLinkedRows] = useState<ScheduleSlot[]>([]);
  const [clinicianLinkedRows, setClinicianLinkedRows] = useState<Clinician[]>([]);
  const [appUserLinkedRows, setAppUserLinkedRows] = useState<AppUser[]>([]);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await facilityService.list();
      setRecord(rows.find((r) => String(r.facility_id) === String(id)) ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Facility');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [id]);

  useEffect(() => {
    if (!record) return;
    appointmentService.list()
      .then((rows) => setAppointmentLinkedRows(rows.filter((r) => String(r.facility_id) === String(record.facility_id))))
      .catch(() => setAppointmentLinkedRows([]));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    scheduleSlotService.list()
      .then((rows) => setScheduleSlotLinkedRows(rows.filter((r) => String(r.facility_id) === String(record.facility_id))))
      .catch(() => setScheduleSlotLinkedRows([]));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    clinicianService.list()
      .then((rows) => setClinicianLinkedRows(rows.filter((r) => String(r.facility_id) === String(record.facility_id))))
      .catch(() => setClinicianLinkedRows([]));
  }, [record]);

  useEffect(() => {
    if (!record) return;
    appUserService.list()
      .then((rows) => setAppUserLinkedRows(rows.filter((r) => String(r.facility_id) === String(record.facility_id))))
      .catch(() => setAppUserLinkedRows([]));
  }, [record]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-md border border-slate-200 bg-white p-3.5" />;
  }

  if (!record) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-3.5 text-center text-sm text-slate-500">
        Facility not found.
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => navigate('/facilities')}>
            Back to Facilities
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/facilities')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Facilities
        </button>
        <Button icon={<PencilIcon className="h-4 w-4" />} onClick={() => navigate('/facilities/' + id + '/edit')}>
          Edit
        </Button>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h1 className="text-lg font-semibold text-slate-900">{formatCell(record.name)}</h1>
        <p className="mt-1 text-sm text-slate-500">Facility details</p>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Facility Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.facility_id)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Name</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.name)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Address</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.address)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">City</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.city)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">State</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.state)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Zip Code</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.zip_code)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Phone Number</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.phone_number)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Ehr Source System</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.ehr_source_system)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Facility Type</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.facility_type)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.status)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Created At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.created_at)}</dd>
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
        <h2 className="text-sm font-semibold text-slate-900">Clinicians</h2>
        {clinicianLinkedRows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No linked clinicians.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {clinicianLinkedRows.map((row) => (
              <li key={String(row.clinician_id)}>
                <Link to={`/clinicians/${row.clinician_id}`} className="block py-2 text-sm text-brand-600 hover:underline">
                  {formatCell(row.first_name)}
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
