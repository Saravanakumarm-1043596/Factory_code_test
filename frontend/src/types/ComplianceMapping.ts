export interface ComplianceMapping {
  compliance_mapping_id: number;
  framework: string;
  control_id: string;
  control_name: string;
  description?: string | null;
  protected_system_id?: number | null;
  firewall_rule_set_id?: number | null;
  compliance_status: string;
  evidence_file?: string | null;
  last_assessed_at?: string | null;
  assessor?: string | null;
  notes?: string | null;
}

export type ComplianceMappingCreateInput = Omit<ComplianceMapping, 'compliance_mapping_id'>;
export type ComplianceMappingUpdateInput = Partial<ComplianceMappingCreateInput>;
