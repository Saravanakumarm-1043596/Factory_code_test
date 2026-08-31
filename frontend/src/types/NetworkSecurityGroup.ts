export interface NetworkSecurityGroup {
  network_security_group_id: number;
  name: string;
  azure_resource_id: string;
  subscription: string;
  resource_group: string;
  region: string;
  associated_subnet?: string | null;
  associated_nic?: string | null;
  total_rule_count: number;
  last_synced_at: string;
  notes?: string | null;
}

export type NetworkSecurityGroupCreateInput = Omit<NetworkSecurityGroup, 'network_security_group_id'>;
export type NetworkSecurityGroupUpdateInput = Partial<NetworkSecurityGroupCreateInput>;
