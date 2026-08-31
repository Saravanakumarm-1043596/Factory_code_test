export interface AuditScan {
  audit_scan_id: number;
  scan_name: string;
  scan_type: string;
  status: string;
  scope_description?: string | null;
  total_rules_analyzed?: number | null;
  issues_found?: number | null;
  critical_issues_found?: number | null;
  initiated_by: string;
  report_file?: string | null;
  started_at: string;
  completed_at?: string | null;
}

export type AuditScanCreateInput = Omit<AuditScan, 'audit_scan_id'>;
export type AuditScanUpdateInput = Partial<AuditScanCreateInput>;
