export type UserRole = 'ADMIN' | 'MANAGER' | 'MEMBER';

export interface UserSummary {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar: string;
  role: UserRole;
}

export interface UserProfile extends UserSummary {
  bio: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  access?: string;
  refresh?: string;
  user: UserSummary;
  message?: string;
}

export interface UserFilterParams {
  search?: string;
  role?: string;
  ordering?: string;
}
