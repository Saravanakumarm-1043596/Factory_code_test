export interface Member {
  member_id: number;
  facets_member_id: string;
  epic_mrn?: string | null;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  email?: string | null;
  phone?: string | null;
  line_of_business_id: number;
  plan_type: string;
  coverage_start_date: string;
  coverage_end_date?: string | null;
  member_status: string;
  created_at: string;
}

export type MemberCreateInput = Omit<Member, 'member_id'>;
export type MemberUpdateInput = Partial<MemberCreateInput>;
