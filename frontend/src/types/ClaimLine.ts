export interface ClaimLine {
  claim_line_id: number;
  claim_id: number;
  line_number: number;
  cpt_code: string;
  modifier?: string | null;
  icd10_pointer?: string | null;
  units: number;
  billed_amount: number;
  allowed_amount?: number | null;
  paid_amount?: number | null;
  line_status: string;
  denial_reason_code?: string | null;
  lab_test_line_id?: number | null;
  created_at: string;
}

export type ClaimLineCreateInput = Omit<ClaimLine, 'claim_line_id'>;
export type ClaimLineUpdateInput = Partial<ClaimLineCreateInput>;
