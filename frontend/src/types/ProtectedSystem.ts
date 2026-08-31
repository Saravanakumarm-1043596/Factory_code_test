export interface ProtectedSystem {
  protected_system_id: number;
  name: string;
  system_type: string;
  environment: string;
  contains_phi: boolean;
  data_classification: string;
  owner: string;
  ip_range?: string | null;
  compliance_scope: string;
  last_assessment_date?: string | null;
  notes?: string | null;
}

export type ProtectedSystemCreateInput = Omit<ProtectedSystem, 'protected_system_id'>;
export type ProtectedSystemUpdateInput = Partial<ProtectedSystemCreateInput>;
