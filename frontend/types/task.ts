export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedTaskList {
  count: number;
  next: string | null;
  previous: string | null;
  results: Task[];
}

export interface TaskFilterParams {
  search?: string;
  status?: string;
  priority?: string;
  ordering?: string;
  page?: number;
}
