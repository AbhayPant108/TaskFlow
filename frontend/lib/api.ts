import axios from 'axios';
import { PaginatedTaskList, Task, TaskFilterParams } from '@/types/task';
import { TaskFormValues } from '@/schemas/taskSchema';



export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const taskApi = {
  getTasks: async (params?: TaskFilterParams): Promise<PaginatedTaskList> => {
    // Filter out empty string params
    const cleanParams: Record<string, string | number> = {};
    if (params) {
      if (params.search) cleanParams.search = params.search;
      if (params.status && params.status !== 'ALL') cleanParams.status = params.status;
      if (params.priority && params.priority !== 'ALL') cleanParams.priority = params.priority;
      if (params.ordering) cleanParams.ordering = params.ordering;
      if (params.page && params.page > 1) cleanParams.page = params.page;
    }
    const response = await apiClient.get<PaginatedTaskList>('/tasks/', { params: cleanParams });
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
    };
    const response = await apiClient.post<Task>('/tasks/', payload);
    return response.data;
  },

  updateTask: async (id: number, data: Partial<TaskFormValues>): Promise<Task> => {
    const payload = {
      ...data,
      due_date: data.due_date ? new Date(data.due_date).toISOString() : (data.due_date === '' ? null : data.due_date),
    };
    const response = await apiClient.patch<Task>(`/tasks/${id}/`, payload);
    return response.data;
  },

  deleteTask: async (id: number): Promise<void> => {
    await apiClient.delete(`/tasks/${id}/`);
  },
};
