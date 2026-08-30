export interface ClaimError {
  claim_error_id: number;
  claim_id: number;
  claim_line_id?: number | null;
  error_category: string;
  error_severity: string;
  error_description: string;
  source_system_origin: string;
  resolution_status: string;
  assigned_to?: string | null;
  resolution_notes?: string | null;
  detected_date: string;
  resolved_date?: string | null;
  created_at: string;
}

export type ClaimErrorCreateInput = Omit<ClaimError, 'claim_error_id'>;
export type ClaimErrorUpdateInput = Partial<ClaimErrorCreateInput>;
