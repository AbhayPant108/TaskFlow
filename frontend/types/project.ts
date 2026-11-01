import { UserSummary } from './user';

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export type ProjectMemberRole = 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface ProjectMember {
  id: number;
  user: UserSummary;
  role: ProjectMemberRole;
  joined_at: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  color: string;
  owner: UserSummary;
  members_count: number;
  tasks_count: number;
  completed_tasks_count?: number;
  current_user_role?: 'OWNER' | ProjectMemberRole | null;
  memberships?: ProjectMember[];
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectFilterParams {
  search?: string;
  status?: string;
  ordering?: string;
}

export interface AddMemberPayload {
  user_id?: number;
  email?: string;
  role: ProjectMemberRole;
}
