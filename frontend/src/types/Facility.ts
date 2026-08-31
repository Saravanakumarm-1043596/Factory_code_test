export interface Facility {
  facility_id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone_number: string;
  ehr_source_system: string;
  facility_type: string;
  status: string;
  created_at: string;
}

export type FacilityCreateInput = Omit<Facility, 'facility_id'>;
export type FacilityUpdateInput = Partial<FacilityCreateInput>;
