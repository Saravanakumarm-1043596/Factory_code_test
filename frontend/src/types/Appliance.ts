export interface Appliance {
  appliance_id: number;
  name: string;
  appliance_type: string;
  ip_address: string;
  hostname?: string | null;
  environment: string;
  firmware_version?: string | null;
  total_rule_count: number;
  last_synced_at: string;
  notes?: string | null;
}

export type ApplianceCreateInput = Omit<Appliance, 'appliance_id'>;
export type ApplianceUpdateInput = Partial<ApplianceCreateInput>;
