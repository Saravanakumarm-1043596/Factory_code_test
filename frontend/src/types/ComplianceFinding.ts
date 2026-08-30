export interface ComplianceFinding {
  compliance_finding_id: number;
  compliance_control_id: number;
  finding_type: string;
  severity: string;
  description: string;
  affected_system: string;
  affected_line_of_business_id?: number | null;
  status: string;
  assigned_to?: string | null;
  remediation_plan?: string | null;
  due_date?: string | null;
  evidence_attachment?: string | null;
  found_date: string;
  resolved_date?: string | null;
  created_at: string;
}

export type ComplianceFindingCreateInput = Omit<ComplianceFinding, 'compliance_finding_id'>;
export type ComplianceFindingUpdateInput = Partial<ComplianceFindingCreateInput>;
