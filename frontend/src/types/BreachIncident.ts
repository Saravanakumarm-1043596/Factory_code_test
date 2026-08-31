export interface BreachIncident {
  breach_incident_id: string;
  reported_by_user_id: string;
  severity: string;
  breach_type: string;
  status: string;
  affected_patient_count: number;
  description: string;
  discovered_at: string;
  reported_at: string;
  hhs_notification_deadline: string;
  hhs_notified_at?: string | null;
  patient_notification_sent_at?: string | null;
  root_cause?: string | null;
  remediation_plan?: string | null;
  supporting_document?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
}

export type BreachIncidentCreateInput = Omit<BreachIncident, 'breach_incident_id'>;
export type BreachIncidentUpdateInput = Partial<BreachIncidentCreateInput>;
