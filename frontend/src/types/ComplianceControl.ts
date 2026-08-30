export interface ComplianceControl {
  compliance_control_id: number;
  control_framework: string;
  control_identifier: string;
  control_name: string;
  description: string;
  control_category: string;
  status: string;
  risk_level: string;
  last_assessment_date?: string | null;
  next_assessment_date?: string | null;
  responsible_party: string;
  evidence_document?: string | null;
  remediation_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type ComplianceControlCreateInput = Omit<ComplianceControl, 'compliance_control_id'>;
export type ComplianceControlUpdateInput = Partial<ComplianceControlCreateInput>;
