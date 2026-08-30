export interface LineOfBusiness {
  line_of_business_id: number;
  name: string;
  description?: string | null;
  regulatory_framework: string;
  is_active: boolean;
  created_at: string;
}

export type LineOfBusinessCreateInput = Omit<LineOfBusiness, 'line_of_business_id'>;
export type LineOfBusinessUpdateInput = Partial<LineOfBusinessCreateInput>;
