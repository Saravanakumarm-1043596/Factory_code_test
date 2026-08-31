export interface ConsentRecord {
  consent_record_id: string;
  patient_id: string;
  consent_type: string;
  status: string;
  granted_at: string;
  expires_at?: string | null;
  revoked_at?: string | null;
  collected_by_user_id: string;
  consent_document?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type ConsentRecordCreateInput = Omit<ConsentRecord, 'consent_record_id'>;
export type ConsentRecordUpdateInput = Partial<ConsentRecordCreateInput>;
