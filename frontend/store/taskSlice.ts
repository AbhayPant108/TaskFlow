import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Task, TaskFilterParams, TaskStatus } from '@/types/task';
import { TaskFormValues } from '@/schemas/taskSchema';
import { taskApi } from '@/lib/api';

export interface TaskState {
  items: Task[];
  totalCount: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  mutationStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  filters: {
    search: string;
    status: string;
    priority: string;
    project: number | 'ALL';
    assignedTo: number | 'ALL' | 'UNASSIGNED';
    ordering: string;
    page: number;
  };
  // Modal state
  isFormOpen: boolean;
  selectedTask: Task | null;
  isDeleteOpen: boolean;
  taskToDelete: Task | null;
}

const initialState: TaskState = {
  items: [],
  totalCount: 0,
  status: 'idle',
  mutationStatus: 'idle',
  error: null,
  filters: {
    search: '',
    status: 'ALL',
    priority: 'ALL',
    project: 'ALL',
    assignedTo: 'ALL',
    ordering: '-created_at',
    page: 1,
  },
  isFormOpen: false,
  selectedTask: null,
  isDeleteOpen: false,
  taskToDelete: null,
};

// Async Thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { tasks: TaskState };
      const { filters } = state.tasks;
      const params: TaskFilterParams = {
        search: filters.search,
        status: filters.status,
        priority: filters.priority,
        ordering: filters.ordering,
        page: filters.page,
      };

      if (filters.project !== 'ALL') {
        params.project = filters.project;
      }

      if (filters.assignedTo === 'UNASSIGNED') {
        params.is_assigned = false;
      } else if (filters.assignedTo !== 'ALL') {
        params.assigned_to = filters.assignedTo;
      }

      return await taskApi.getTasks(params);
    } catch (err: any) {
      const message = err.response?.data?.detail || err.message || 'Failed to fetch tasks';
      return rejectWithValue(message);
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData: TaskFormValues, { dispatch, rejectWithValue }) => {
    try {
      const created = await taskApi.createTask(taskData);
      dispatch(fetchTasks());
      return created;
    } catch (err: any) {
      const data = err.response?.data;
      const message =
        data?.detail ||
        data?.title?.[0] ||
        data?.project?.[0] ||
        data?.assigned_to?.[0] ||
        (typeof data === 'object' ? JSON.stringify(data) : 'Failed to create task');
      return rejectWithValue(message);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async (
    { id, data }: { id: number; data: Partial<TaskFormValues> },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const updated = await taskApi.updateTask(id, data);
      dispatch(fetchTasks());
      return updated;
    } catch (err: any) {
      const data = err.response?.data;
      const message =
        data?.detail ||
        data?.title?.[0] ||
        data?.assigned_to?.[0] ||
        (typeof data === 'object' ? JSON.stringify(data) : 'Failed to update task');
      return rejectWithValue(message);
    }
  }
);

export const moveTaskStatus = createAsyncThunk(
  'tasks/moveTaskStatus',
  async (
    { id, status }: { id: number; status: TaskStatus },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const updated = await taskApi.updateTask(id, { status } as any);
      dispatch(fetchTasks());
      return updated;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to update status');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      await taskApi.deleteTask(id);
      dispatch(fetchTasks());
      return id;
    } catch (err: any) {
      const message = err.response?.data?.detail || err.message || 'Failed to delete task';
      return rejectWithValue(message);
    }
  }
);

export const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setLoadingState: (state, action: PayloadAction<'idle' | 'loading' | 'succeeded' | 'failed'>) => {
      state.status = action.payload;
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.filters.page = 1;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.filters.status = action.payload;
      state.filters.page = 1;
    },
    setPriorityFilter: (state, action: PayloadAction<string>) => {
      state.filters.priority = action.payload;
      state.filters.page = 1;
    },
    setProjectFilter: (state, action: PayloadAction<number | 'ALL'>) => {
      state.filters.project = action.payload;
      state.filters.page = 1;
    },
    setAssignedFilter: (state, action: PayloadAction<number | 'ALL' | 'UNASSIGNED'>) => {
      state.filters.assignedTo = action.payload;
      state.filters.page = 1;
    },
    setOrdering: (state, action: PayloadAction<string>) => {
      state.filters.ordering = action.payload;
      state.filters.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.filters.page = action.payload;
    },
    resetFilters: (state) => {
      state.filters = {
        search: '',
        status: 'ALL',
        priority: 'ALL',
        project: 'ALL',
        assignedTo: 'ALL',
        ordering: '-created_at',
        page: 1,
      };
    },
    openCreateModal: (state) => {
      state.selectedTask = null;
      state.isFormOpen = true;
      state.error = null;
    },
    openEditModal: (state, action: PayloadAction<Task>) => {
      state.selectedTask = action.payload;
      state.isFormOpen = true;
      state.error = null;
    },
    closeFormModal: (state) => {
      state.selectedTask = null;
      state.isFormOpen = false;
      state.error = null;
    },
    openDeleteModal: (state, action: PayloadAction<Task>) => {
      state.taskToDelete = action.payload;
      state.isDeleteOpen = true;
    },
    closeDeleteModal: (state) => {
      state.taskToDelete = null;
      state.isDeleteOpen = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTasks
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.results;
        state.totalCount = action.payload.count;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // createTask
      .addCase(createTask.pending, (state) => {
        state.mutationStatus = 'loading';
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
        state.isFormOpen = false;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.error = action.payload as string;
      })

      // updateTask
      .addCase(updateTask.pending, (state) => {
        state.mutationStatus = 'loading';
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
        state.isFormOpen = false;
        state.selectedTask = null;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.error = action.payload as string;
      })

      // moveTaskStatus (optimistic update)
      .addCase(moveTaskStatus.pending, (state, action) => {
        const { id, status } = action.meta.arg;
        const task = state.items.find((t) => t.id === id);
        if (task) {
          task.status = status;
        }
      })

      // deleteTask
      .addCase(deleteTask.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(deleteTask.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
        state.isDeleteOpen = false;
        state.taskToDelete = null;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const {
  setLoadingState,
  setSearch,
  setStatusFilter,
  setPriorityFilter,
  setProjectFilter,
  setAssignedFilter,
  setOrdering,
  setPage,
  resetFilters,
  openCreateModal,
  openEditModal,
  closeFormModal,
  openDeleteModal,
  closeDeleteModal,
} = taskSlice.actions;

export default taskSlice.reducer;
