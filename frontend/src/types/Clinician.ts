export interface Clinician {
  clinician_id: string;
  first_name: string;
  last_name: string;
  email: string;
  npi_number: string;
  specialty: string;
  ehr_source_system: string;
  facility_id: string;
  status: string;
  max_daily_appointments: number;
  created_at: string;
  updated_at: string;
}

export type ClinicianCreateInput = Omit<Clinician, 'clinician_id'>;
export type ClinicianUpdateInput = Partial<ClinicianCreateInput>;
