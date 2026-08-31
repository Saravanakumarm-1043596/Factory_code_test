export interface EhrintegrationEvent {
  ehr_integration_event_id: string;
  source_system: string;
  direction: string;
  event_type: string;
  message_id: string;
  patient_id?: string | null;
  appointment_id?: string | null;
  status: string;
  error_message?: string | null;
  retry_count: number;
  payload_file?: string | null;
  occurred_at: string;
  processed_at?: string | null;
  created_at: string;
}

export type EhrintegrationEventCreateInput = Omit<EhrintegrationEvent, 'ehr_integration_event_id'>;
export type EhrintegrationEventUpdateInput = Partial<EhrintegrationEventCreateInput>;
