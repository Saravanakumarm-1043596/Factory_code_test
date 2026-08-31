export interface Appointment {
  appointment_id: string;
  patient_id: string;
  clinician_id: string;
  facility_id: string;
  appointment_type: string;
  visit_reason: string;
  scheduled_datetime: string;
  duration_minutes: number;
  status: string;
  no_show_risk_score?: number | null;
  predicted_optimal_slot?: string | null;
  ehr_source_system: string;
  ehr_encounter_id?: string | null;
  cancellation_reason?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type AppointmentCreateInput = Omit<Appointment, 'appointment_id'>;
export type AppointmentUpdateInput = Partial<AppointmentCreateInput>;
