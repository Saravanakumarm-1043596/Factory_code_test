export interface AppUser {
  app_user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  clinician_id?: string | null;
  facility_id?: string | null;
  status: string;
  mfa_enabled: boolean;
  last_login_at?: string | null;
  password_changed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export type AppUserCreateInput = Omit<AppUser, 'app_user_id'>;
export type AppUserUpdateInput = Partial<AppUserCreateInput>;
