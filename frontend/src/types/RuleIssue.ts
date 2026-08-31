export interface RuleIssue {
  rule_issue_id: number;
  firewall_rule_id: number;
  related_rule_id?: number | null;
  issue_type: string;
  severity: string;
  status: string;
  description: string;
  recommendation?: string | null;
  phi_exposure_risk: boolean;
  detected_at: string;
  resolved_at?: string | null;
  assigned_to?: string | null;
  notes?: string | null;
}

export type RuleIssueCreateInput = Omit<RuleIssue, 'rule_issue_id'>;
export type RuleIssueUpdateInput = Partial<RuleIssueCreateInput>;
