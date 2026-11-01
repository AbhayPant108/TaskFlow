import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { PaginatedTaskList, Task, TaskFilterParams } from '@/types/task';
import { TaskFormValues } from '@/schemas/taskSchema';
import {
  Project,
  ProjectFilterParams,
  ProjectMember,
  AddMemberPayload,
} from '@/types/project';
import { ProjectFormValues } from '@/schemas/projectSchema';
import {
  UserProfile,
  UserSummary,
  UserFilterParams,
  AuthResponse,
} from '@/types/user';
import {
  LoginFormValues,
  RegisterFormValues,
  ProfileFormValues,
  ChangePasswordFormValues,
} from '@/schemas/authSchema';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 15000,
});

// Storage keys
const TOKEN_KEY = 'taskflow_access_token';
const REFRESH_KEY = 'taskflow_refresh_token';

export const tokenStorage = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  setTokens: (access: string, refresh?: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_KEY);
  },
  clearTokens: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// Request interceptor to attach bearer token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    if (token && config.headers && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auto-refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login/') &&
      !originalRequest.url?.includes('/auth/register/') &&
      !originalRequest.url?.includes('/auth/refresh/')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenStorage.getRefreshToken();

      try {
        const { data } = await axios.post<{ access: string; refresh?: string }>(
          `${API_BASE_URL}/auth/refresh/`,
          refreshToken ? { refresh: refreshToken } : {},
          { withCredentials: true }
        );

        tokenStorage.setTokens(data.access, data.refresh);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
        processQueue(null, data.access);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
        }
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr as Error, null);
        tokenStorage.clearTokens();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Authentication API
// ---------------------------------------------------------------------------
export const authApi = {
  login: async (credentials: LoginFormValues): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login/', credentials);
    if (response.data.access) {
      tokenStorage.setTokens(response.data.access, response.data.refresh);
    }
    return response.data;
  },

  register: async (payload: RegisterFormValues): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register/', payload);
    if (response.data.access) {
      tokenStorage.setTokens(response.data.access, response.data.refresh);
    }
    return response.data;
  },

  logout: async (): Promise<void> => {
    const refresh = tokenStorage.getRefreshToken();
    try {
      await apiClient.post('/auth/logout/', refresh ? { refresh } : {});
    } finally {
      tokenStorage.clearTokens();
    }
  },

  getMe: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>('/auth/me/');
    return response.data;
  },

  updateProfile: async (data: ProfileFormValues): Promise<UserProfile> => {
    const response = await apiClient.patch<UserProfile>('/auth/me/', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordFormValues): Promise<{ detail: string }> => {
    const response = await apiClient.post<{ detail: string }>('/auth/change-password/', data);
    return response.data;
  },
};

// ---------------------------------------------------------------------------
// Users Directory API
// ---------------------------------------------------------------------------
export const userApi = {
  getUsers: async (params?: UserFilterParams): Promise<UserSummary[]> => {
    const cleanParams: Record<string, string> = {};
    if (params?.search) cleanParams.search = params.search;
    if (params?.role && params.role !== 'ALL') cleanParams.role = params.role;
    if (params?.ordering) cleanParams.ordering = params.ordering;

    const response = await apiClient.get<UserSummary[] | { results: UserSummary[] }>('/users/', {
      params: cleanParams,
    });
    // DRF may paginate or return raw array depending on view settings
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return (response.data as { results: UserSummary[] }).results || [];
  },

  getUserById: async (id: number): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>(`/users/${id}/`);
    return response.data;
  },
};

// ---------------------------------------------------------------------------
// Projects API
// ---------------------------------------------------------------------------
export const projectApi = {
  getProjects: async (params?: ProjectFilterParams): Promise<Project[]> => {
    const cleanParams: Record<string, string> = {};
    if (params?.search) cleanParams.search = params.search;
    if (params?.status && params.status !== 'ALL') cleanParams.status = params.status;
    if (params?.ordering) cleanParams.ordering = params.ordering;

    const response = await apiClient.get<Project[] | { results: Project[] }>('/projects/', {
      params: cleanParams,
    });
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return (response.data as { results: Project[] }).results || [];
  },

  getProjectById: async (id: number): Promise<Project> => {
    const response = await apiClient.get<Project>(`/projects/${id}/`);
    return response.data;
  },

  createProject: async (data: ProjectFormValues): Promise<Project> => {
    const payload = {
      ...data,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
    };
    const response = await apiClient.post<Project>('/projects/', payload);
    return response.data;
  },

  updateProject: async (id: number, data: Partial<ProjectFormValues>): Promise<Project> => {
    const response = await apiClient.patch<Project>(`/projects/${id}/`, data);
    return response.data;
  },

  deleteProject: async (id: number): Promise<void> => {
    await apiClient.delete(`/projects/${id}/`);
  },

  getProjectMembers: async (projectId: number): Promise<ProjectMember[]> => {
    const response = await apiClient.get<ProjectMember[]>(`/projects/${projectId}/members/`);
    return response.data;
  },

  addProjectMember: async (
    projectId: number,
    payload: AddMemberPayload
  ): Promise<ProjectMember> => {
    const response = await apiClient.post<ProjectMember>(
      `/projects/${projectId}/members/`,
      payload
    );
    return response.data;
  },

  updateProjectMemberRole: async (
    projectId: number,
    userId: number,
    role: string
  ): Promise<ProjectMember> => {
    const response = await apiClient.patch<ProjectMember>(
      `/projects/${projectId}/members/${userId}/`,
      { role }
    );
    return response.data;
  },

  removeProjectMember: async (projectId: number, userId: number): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/members/${userId}/`);
  },

  getProjectTasks: async (projectId: number): Promise<Task[]> => {
    const response = await apiClient.get<Task[]>(`/projects/${projectId}/tasks/`);
    return response.data;
  },
};

// ---------------------------------------------------------------------------
// Tasks API
// ---------------------------------------------------------------------------
export const taskApi = {
  getTasks: async (params?: TaskFilterParams): Promise<PaginatedTaskList> => {
    const cleanParams: Record<string, string | number | boolean> = {};
    if (params) {
      if (params.search) cleanParams.search = params.search;
      if (params.status && params.status !== 'ALL') cleanParams.status = params.status;
      if (params.priority && params.priority !== 'ALL') cleanParams.priority = params.priority;
      if (params.project) cleanParams.project = params.project;
      if (params.assigned_to) cleanParams.assigned_to = params.assigned_to;
      if (params.is_assigned !== undefined) cleanParams.is_assigned = params.is_assigned;
      if (params.ordering) cleanParams.ordering = params.ordering;
      if (params.page && params.page > 1) cleanParams.page = params.page;
    }
    const response = await apiClient.get<PaginatedTaskList | Task[]>('/tasks/', {
      params: cleanParams,
    });

    // Support both paginated response and list
    if (Array.isArray(response.data)) {
      return {
        count: response.data.length,
        next: null,
        previous: null,
        results: response.data,
      };
    }
    return response.data;
  },

  getTaskById: async (id: number): Promise<Task> => {
    const response = await apiClient.get<Task>(`/tasks/${id}/`);
    return response.data;
  },

  createTask: async (data: TaskFormValues): Promise<Task> => {
    const payload = {
      ...data,
      due_date: data.due_date ? new Date(data.due_date).toISOString() : null,
      assigned_to_id: data.assigned_to_id || null,
    };
    const response = await apiClient.post<Task>('/tasks/', payload);
    return response.data;
  },

  updateTask: async (id: number, data: Partial<TaskFormValues>): Promise<Task> => {
    const payload: Record<string, any> = { ...data };
    if ('due_date' in data) {
      payload.due_date = data.due_date
        ? new Date(data.due_date).toISOString()
        : data.due_date === ''
        ? null
        : data.due_date;
    }
    if ('assigned_to_id' in data) {
      payload.assigned_to_id = data.assigned_to_id || null;
    }
    const response = await apiClient.patch<Task>(`/tasks/${id}/`, payload);
    return response.data;
  },

  deleteTask: async (id: number): Promise<void> => {
    await apiClient.delete(`/tasks/${id}/`);
  },
};
