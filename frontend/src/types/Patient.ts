export interface Patient {
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  email?: string | null;
  phone_number: string;
  preferred_contact_method: string;
  preferred_language: string;
  membership_status: string;
  ehr_source_system: string;
  ehr_medical_record_number: string;
  no_show_risk_score?: number | null;
  risk_score_updated_at?: string | null;
  enrollment_date: string;
  consent_document?: string | null;
  created_at: string;
  updated_at: string;
}

export type PatientCreateInput = Omit<Patient, 'patient_id'>;
export type PatientUpdateInput = Partial<PatientCreateInput>;
