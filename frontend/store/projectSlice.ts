import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Project, ProjectMember, ProjectFilterParams, AddMemberPayload } from '@/types/project';
import { ProjectFormValues } from '@/schemas/projectSchema';
import { projectApi } from '@/lib/api';

export interface ProjectState {
  items: Project[];
  activeProject: Project | null;
  activeProjectMembers: ProjectMember[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  mutationStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  filters: {
    search: string;
    status: string;
  };
  // Modals
  isFormOpen: boolean;
  selectedProject: Project | null;
  isMemberModalOpen: boolean;
  isDeleteOpen: boolean;
  projectToDelete: Project | null;
}

const initialState: ProjectState = {
  items: [],
  activeProject: null,
  activeProjectMembers: [],
  status: 'idle',
  mutationStatus: 'idle',
  error: null,
  filters: {
    search: '',
    status: 'ALL',
  },
  isFormOpen: false,
  selectedProject: null,
  isMemberModalOpen: false,
  isDeleteOpen: false,
  projectToDelete: null,
};

// Async Thunks
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { projects: ProjectState };
      const { filters } = state.projects;
      const params: ProjectFilterParams = {
        search: filters.search,
        status: filters.status,
      };
      return await projectApi.getProjects(params);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch projects');
    }
  }
);

export const fetchProjectById = createAsyncThunk(
  'projects/fetchProjectById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await projectApi.getProjectById(id);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch project');
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (data: ProjectFormValues, { dispatch, rejectWithValue }) => {
    try {
      const created = await projectApi.createProject(data);
      dispatch(fetchProjects());
      return created;
    } catch (err: any) {
      const data = err.response?.data;
      const msg = typeof data === 'object' ? JSON.stringify(data) : 'Failed to create project';
      return rejectWithValue(msg);
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async (
    { id, data }: { id: number; data: Partial<ProjectFormValues> },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const updated = await projectApi.updateProject(id, data);
      dispatch(fetchProjects());
      return updated;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to update project');
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      await projectApi.deleteProject(id);
      dispatch(fetchProjects());
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to delete project');
    }
  }
);

export const fetchProjectMembers = createAsyncThunk(
  'projects/fetchProjectMembers',
  async (projectId: number, { rejectWithValue }) => {
    try {
      return await projectApi.getProjectMembers(projectId);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch members');
    }
  }
);

export const addProjectMember = createAsyncThunk(
  'projects/addProjectMember',
  async (
    { projectId, payload }: { projectId: number; payload: AddMemberPayload },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const member = await projectApi.addProjectMember(projectId, payload);
      dispatch(fetchProjectMembers(projectId));
      dispatch(fetchProjects());
      return member;
    } catch (err: any) {
      const data = err.response?.data;
      const msg =
        data?.user_id?.[0] ||
        data?.email?.[0] ||
        data?.non_field_errors?.[0] ||
        (typeof data === 'string' ? data : 'Failed to add member');
      return rejectWithValue(msg);
    }
  }
);

export const updateMemberRole = createAsyncThunk(
  'projects/updateMemberRole',
  async (
    { projectId, userId, role }: { projectId: number; userId: number; role: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const updated = await projectApi.updateProjectMemberRole(projectId, userId, role);
      dispatch(fetchProjectMembers(projectId));
      return updated;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to update member role');
    }
  }
);

export const removeProjectMember = createAsyncThunk(
  'projects/removeProjectMember',
  async (
    { projectId, userId }: { projectId: number; userId: number },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await projectApi.removeProjectMember(projectId, userId);
      dispatch(fetchProjectMembers(projectId));
      dispatch(fetchProjects());
      return userId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to remove member');
    }
  }
);

export const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setActiveProject: (state, action: PayloadAction<Project | null>) => {
      state.activeProject = action.payload;
    },
    setProjectSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
    },
    setProjectStatusFilter: (state, action: PayloadAction<string>) => {
      state.filters.status = action.payload;
    },
    openProjectForm: (state, action: PayloadAction<Project | null>) => {
      state.selectedProject = action.payload;
      state.isFormOpen = true;
    },
    closeProjectForm: (state) => {
      state.selectedProject = null;
      state.isFormOpen = false;
    },
    openMemberModal: (state) => {
      state.isMemberModalOpen = true;
    },
    closeMemberModal: (state) => {
      state.isMemberModalOpen = false;
    },
    openDeleteProjectModal: (state, action: PayloadAction<Project>) => {
      state.projectToDelete = action.payload;
      state.isDeleteOpen = true;
    },
    closeDeleteProjectModal: (state) => {
      state.projectToDelete = null;
      state.isDeleteOpen = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProjects
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // fetchProjectById
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.activeProject = action.payload;
        if (action.payload.memberships) {
          state.activeProjectMembers = action.payload.memberships;
        }
      })

      // fetchProjectMembers
      .addCase(fetchProjectMembers.fulfilled, (state, action) => {
        state.activeProjectMembers = action.payload;
      })

      // createProject
      .addCase(createProject.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.isFormOpen = false;
        state.selectedProject = null;
        if (!state.activeProject) {
          state.activeProject = action.payload;
        }
      })
      .addCase(createProject.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.error = action.payload as string;
      })

      // updateProject
      .addCase(updateProject.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.isFormOpen = false;
        state.selectedProject = null;
        if (state.activeProject?.id === action.payload.id) {
          state.activeProject = action.payload;
        }
      })

      // deleteProject
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.isDeleteOpen = false;
        state.projectToDelete = null;
        if (state.activeProject?.id === action.payload) {
          state.activeProject = null;
        }
      });
  },
});

export const {
  setActiveProject,
  setProjectSearch,
  setProjectStatusFilter,
  openProjectForm,
  closeProjectForm,
  openMemberModal,
  closeMemberModal,
  openDeleteProjectModal,
  closeDeleteProjectModal,
} = projectSlice.actions;

export default projectSlice.reducer;
