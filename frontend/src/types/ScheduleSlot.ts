export interface ScheduleSlot {
  schedule_slot_id: string;
  clinician_id: string;
  facility_id: string;
  slot_start: string;
  slot_end: string;
  slot_type: string;
  status: string;
  appointment_id?: string | null;
  demand_score?: number | null;
  created_at: string;
}

export type ScheduleSlotCreateInput = Omit<ScheduleSlot, 'schedule_slot_id'>;
export type ScheduleSlotUpdateInput = Partial<ScheduleSlotCreateInput>;
