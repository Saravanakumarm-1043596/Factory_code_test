export interface LabTestLine {
  lab_test_line_id: number;
  lab_test_order_id: number;
  cpt_code: string;
  test_name: string;
  loinc_code?: string | null;
  test_category: string;
  result_value?: string | null;
  result_unit?: string | null;
  reference_range?: string | null;
  abnormal_flag?: string | null;
  line_status: string;
  result_date?: string | null;
  created_at: string;
}

export type LabTestLineCreateInput = Omit<LabTestLine, 'lab_test_line_id'>;
export type LabTestLineUpdateInput = Partial<LabTestLineCreateInput>;
