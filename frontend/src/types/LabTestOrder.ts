export interface LabTestOrder {
  lab_test_order_id: number;
  order_number: string;
  member_id: number;
  ordering_provider_id: number;
  performing_lab_id: number;
  line_of_business_id: number;
  source_system: string;
  order_status: string;
  priority: string;
  clinical_indication?: string | null;
  icd10_codes?: string | null;
  order_date: string;
  specimen_collection_date?: string | null;
  result_date?: string | null;
  prior_auth_required: boolean;
  prior_auth_number?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type LabTestOrderCreateInput = Omit<LabTestOrder, 'lab_test_order_id'>;
export type LabTestOrderUpdateInput = Partial<LabTestOrderCreateInput>;
