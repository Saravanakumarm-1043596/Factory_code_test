export interface Claim {
  claim_id: number;
  claim_number: string;
  lab_test_order_id: number;
  member_id: number;
  rendering_provider_id: number;
  line_of_business_id: number;
  source_system: string;
  claim_type: string;
  claim_status: string;
  total_billed_amount: number;
  total_allowed_amount?: number | null;
  total_paid_amount?: number | null;
  member_responsibility?: number | null;
  service_date: string;
  submitted_date: string;
  adjudicated_date?: string | null;
  has_error: boolean;
  denial_reason_code?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type ClaimCreateInput = Omit<Claim, 'claim_id'>;
export type ClaimUpdateInput = Partial<ClaimCreateInput>;
