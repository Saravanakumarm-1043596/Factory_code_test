export interface Provider {
  provider_id: number;
  npi: string;
  provider_name: string;
  provider_type: string;
  tax_id: string;
  clia_number?: string | null;
  network_status: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  is_active: boolean;
  created_at: string;
}

export type ProviderCreateInput = Omit<Provider, 'provider_id'>;
export type ProviderUpdateInput = Partial<ProviderCreateInput>;
