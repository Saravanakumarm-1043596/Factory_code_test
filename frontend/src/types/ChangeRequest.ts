export interface ChangeRequest {
  change_request_id: number;
  title: string;
  description: string;
  firewall_rule_set_id: number;
  change_type: string;
  status: string;
  priority: string;
  requestor: string;
  approver?: string | null;
  justification: string;
  risk_assessment?: string | null;
  rule_issue_id?: number | null;
  implementation_notes?: string | null;
  attachment?: string | null;
  submitted_at?: string | null;
  approved_at?: string | null;
  implemented_at?: string | null;
  created_at: string;
}

export type ChangeRequestCreateInput = Omit<ChangeRequest, 'change_request_id'>;
export type ChangeRequestUpdateInput = Partial<ChangeRequestCreateInput>;
