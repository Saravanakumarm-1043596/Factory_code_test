export interface PhiaccessLog {
  phi_access_log_id: string;
  user_id: string;
  patient_id: string;
  resource_type: string;
  resource_id: string;
  action: string;
  access_reason: string;
  ip_address: string;
  user_agent?: string | null;
  ehr_source_system?: string | null;
  access_granted: boolean;
  denial_reason?: string | null;
  accessed_at: string;
}

export type PhiaccessLogCreateInput = Omit<PhiaccessLog, 'phi_access_log_id'>;
export type PhiaccessLogUpdateInput = Partial<PhiaccessLogCreateInput>;
