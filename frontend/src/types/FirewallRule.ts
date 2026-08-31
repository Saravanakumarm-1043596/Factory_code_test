export interface FirewallRule {
  firewall_rule_id: number;
  firewall_rule_set_id: number;
  rule_name: string;
  priority: number;
  direction: string;
  action: string;
  protocol: string;
  source_address: string;
  source_port_range: string;
  destination_address: string;
  destination_port_range: string;
  is_enabled: boolean;
  description?: string | null;
  last_hit_at?: string | null;
  hit_count?: number | null;
  created_at: string;
}

export type FirewallRuleCreateInput = Omit<FirewallRule, 'firewall_rule_id'>;
export type FirewallRuleUpdateInput = Partial<FirewallRuleCreateInput>;
