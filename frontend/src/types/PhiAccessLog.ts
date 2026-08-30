export interface PhiAccessLog {
  phi_access_log_id: number;
  user_id: number;
  entity_type: string;
  entity_record_id: number;
  access_type: string;
  source_system: string;
  access_reason: string;
  ip_address?: string | null;
  access_timestamp: string;
  phi_fields_accessed?: string | null;
  was_authorized: boolean;
  notes?: string | null;
}

export type PhiAccessLogCreateInput = Omit<PhiAccessLog, 'phi_access_log_id'>;
export type PhiAccessLogUpdateInput = Partial<PhiAccessLogCreateInput>;
