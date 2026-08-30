export interface User {
  user_id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  department: string;
  is_active: boolean;
  last_login?: string | null;
  created_at: string;
}

export type UserCreateInput = Omit<User, 'user_id'>;
export type UserUpdateInput = Partial<UserCreateInput>;
