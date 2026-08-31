import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, Pencil as PencilIcon } from 'lucide-react';
import type { ScheduleSlot } from '../types/ScheduleSlot';
import type { Clinician } from '../types/Clinician';
import type { Facility } from '../types/Facility';
import type { Appointment } from '../types/Appointment';
import { scheduleSlotService } from '../services/ScheduleSlotService';
import { clinicianService } from '../services/ClinicianService';
import { facilityService } from '../services/FacilityService';
import { appointmentService } from '../services/AppointmentService';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { formatCell } from '../lib/format';

export function ScheduleSlotDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<ScheduleSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [clinician_idTarget, setClinician_idTarget] = useState<Clinician | null>(null);
  const [facility_idTarget, setFacility_idTarget] = useState<Facility | null>(null);
  const [appointment_idTarget, setAppointment_idTarget] = useState<Appointment | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await scheduleSlotService.list();
      setRecord(rows.find((r) => String(r.schedule_slot_id) === String(id)) ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Schedule Slot');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [id]);

  useEffect(() => {
    const fkValue: unknown = record ? record.clinician_id : null;
    if (fkValue === null || fkValue === undefined || fkValue === '') {
      setClinician_idTarget(null);
      return;
    }
    clinicianService.getById(fkValue as string | number)
      .then((row) => setClinician_idTarget(row ?? null))
      .catch(() => setClinician_idTarget(null));
  }, [record]);

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
    const fkValue: unknown = record ? record.appointment_id : null;
    if (fkValue === null || fkValue === undefined || fkValue === '') {
      setAppointment_idTarget(null);
      return;
    }
    appointmentService.getById(fkValue as string | number)
      .then((row) => setAppointment_idTarget(row ?? null))
      .catch(() => setAppointment_idTarget(null));
  }, [record]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-md border border-slate-200 bg-white p-3.5" />;
  }

  if (!record) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-3.5 text-center text-sm text-slate-500">
        Schedule Slot not found.
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => navigate('/schedule-slots')}>
            Back to Schedule Slots
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/schedule-slots')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Schedule Slots
        </button>
        <Button icon={<PencilIcon className="h-4 w-4" />} onClick={() => navigate('/schedule-slots/' + id + '/edit')}>
          Edit
        </Button>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3.5">
        <h1 className="text-lg font-semibold text-slate-900">{formatCell(record.schedule_slot_id)}</h1>
        <p className="mt-1 text-sm text-slate-500">Schedule Slot details</p>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Schedule Slot Id</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.schedule_slot_id)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Clinician Id</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {clinician_idTarget ? (
                <Link to={`/clinicians/${record.clinician_id}`} className="text-brand-600 hover:underline">
                  {`${clinician_idTarget.first_name}`}
                </Link>
              ) : (
                formatCell(record.clinician_id)
              )}
            </dd>
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
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Slot Start</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.slot_start)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Slot End</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.slot_end)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Slot Type</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.slot_type)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.status)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Appointment Id</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {appointment_idTarget ? (
                <Link to={`/appointments/${record.appointment_id}`} className="text-brand-600 hover:underline">
                  {`#${appointment_idTarget.appointment_id}`}
                </Link>
              ) : (
                formatCell(record.appointment_id)
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Demand Score</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.demand_score)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Created At</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatCell(record.created_at)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
