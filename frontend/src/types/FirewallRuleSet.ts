export interface FirewallRuleSet {
  firewall_rule_set_id: number;
  name: string;
  description?: string | null;
  network_security_group_id?: number | null;
  appliance_id?: number | null;
  protected_system_id?: number | null;
  rule_count: number;
  status: string;
  last_reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export type FirewallRuleSetCreateInput = Omit<FirewallRuleSet, 'firewall_rule_set_id'>;
export type FirewallRuleSetUpdateInput = Partial<FirewallRuleSetCreateInput>;
