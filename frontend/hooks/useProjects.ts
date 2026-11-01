import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchProjects,
  fetchProjectById,
  createProject,
  updateProject,
  deleteProject,
  fetchProjectMembers,
  addProjectMember,
  updateMemberRole,
  removeProjectMember,
  setActiveProject,
  openProjectForm,
  closeProjectForm,
  openMemberModal,
  closeMemberModal,
  openDeleteProjectModal,
  closeDeleteProjectModal,
  setProjectSearch,
  setProjectStatusFilter,
} from '@/store/projectSlice';
import { Project, AddMemberPayload } from '@/types/project';
import { ProjectFormValues } from '@/schemas/projectSchema';

export function useProjects() {
  const dispatch = useAppDispatch();
  const {
    items: projects,
    activeProject,
    activeProjectMembers,
    status,
    mutationStatus,
    error,
    filters,
    isFormOpen,
    selectedProject,
    isMemberModalOpen,
    isDeleteOpen,
    projectToDelete,
  } = useAppSelector((state) => state.projects);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch, filters.search, filters.status]);

  const selectProject = useCallback(
    (project: Project | null) => {
      dispatch(setActiveProject(project));
      if (project) {
        dispatch(fetchProjectMembers(project.id));
      }
    },
    [dispatch]
  );

  const reloadProjects = useCallback(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const loadProjectDetails = useCallback(
    (id: number) => {
      dispatch(fetchProjectById(id));
      dispatch(fetchProjectMembers(id));
    },
    [dispatch]
  );

  const saveProject = useCallback(
    async (values: ProjectFormValues, id?: number) => {
      if (id) {
        return await dispatch(updateProject({ id, data: values })).unwrap();
      }
      return await dispatch(createProject(values)).unwrap();
    },
    [dispatch]
  );

  const removeProject = useCallback(
    async (id: number) => {
      return await dispatch(deleteProject(id)).unwrap();
    },
    [dispatch]
  );

  const addMember = useCallback(
    async (projectId: number, payload: AddMemberPayload) => {
      return await dispatch(addProjectMember({ projectId, payload })).unwrap();
    },
    [dispatch]
  );

  const changeRole = useCallback(
    async (projectId: number, userId: number, role: string) => {
      return await dispatch(updateMemberRole({ projectId, userId, role })).unwrap();
    },
    [dispatch]
  );

  const removeMember = useCallback(
    async (projectId: number, userId: number) => {
      return await dispatch(removeProjectMember({ projectId, userId })).unwrap();
    },
    [dispatch]
  );

  return {
    projects,
    activeProject,
    activeProjectMembers,
    status,
    mutationStatus,
    error,
    filters,
    isFormOpen,
    selectedProject,
    isMemberModalOpen,
    isDeleteOpen,
    projectToDelete,
    selectProject,
    reloadProjects,
    loadProjectDetails,
    saveProject,
    removeProject,
    addMember,
    changeRole,
    removeMember,
    openForm: (p: Project | null = null) => dispatch(openProjectForm(p)),
    closeForm: () => dispatch(closeProjectForm()),
    openMemberDialog: () => dispatch(openMemberModal()),
    closeMemberDialog: () => dispatch(closeMemberModal()),
    openDeleteDialog: (p: Project) => dispatch(openDeleteProjectModal(p)),
    closeDeleteDialog: () => dispatch(closeDeleteProjectModal()),
    setSearch: (s: string) => dispatch(setProjectSearch(s)),
    setStatusFilter: (s: string) => dispatch(setProjectStatusFilter(s)),
  };
}
