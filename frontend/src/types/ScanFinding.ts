export interface ScanFinding {
  scan_finding_id: number;
  audit_scan_id: number;
  rule_issue_id?: number | null;
  firewall_rule_id: number;
  finding_type: string;
  severity: string;
  detail: string;
  auto_resolved: boolean;
  detected_at: string;
}

export type ScanFindingCreateInput = Omit<ScanFinding, 'scan_finding_id'>;
export type ScanFindingUpdateInput = Partial<ScanFindingCreateInput>;
