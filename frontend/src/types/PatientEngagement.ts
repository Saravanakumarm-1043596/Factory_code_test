export interface PatientEngagement {
  patient_engagement_id: string;
  patient_id: string;
  appointment_id: string;
  channel: string;
  engagement_type: string;
  sent_at: string;
  delivered_at?: string | null;
  patient_response?: string | null;
  response_at?: string | null;
  status: string;
  template_name: string;
  created_at: string;
}

export type PatientEngagementCreateInput = Omit<PatientEngagement, 'patient_engagement_id'>;
export type PatientEngagementUpdateInput = Partial<PatientEngagementCreateInput>;
