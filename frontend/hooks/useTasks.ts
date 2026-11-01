import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchTasks,
  createTask,
  updateTask,
  moveTaskStatus,
  deleteTask,
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
} from '@/store/taskSlice';
import { Task, TaskStatus } from '@/types/task';
import { TaskFormValues } from '@/schemas/taskSchema';

export function useTasks() {
  const dispatch = useAppDispatch();
  const {
    items: tasks,
    totalCount,
    status,
    mutationStatus,
    error,
    filters,
    isFormOpen,
    selectedTask,
    isDeleteOpen,
    taskToDelete,
  } = useAppSelector((state) => state.tasks);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;
    dispatch(fetchTasks());
  }, [
    dispatch,
    isAuthenticated,
    filters.search,
    filters.status,
    filters.priority,
    filters.project,
    filters.assignedTo,
    filters.ordering,
    filters.page,
  ]);

  // Derived Kanban columns
  const kanban = useMemo(() => {
    return {
      todo: tasks.filter((t) => t.status === 'TODO'),
      inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS'),
      done: tasks.filter((t) => t.status === 'DONE'),
    };
  }, [tasks]);

  // Derived Task Statistics
  const stats = useMemo(() => {
    const total = totalCount;
    const todo = tasks.filter((t) => t.status === 'TODO').length;
    const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const done = tasks.filter((t) => t.status === 'DONE').length;
    const urgent = tasks.filter((t) => t.priority === 'URGENT' || t.priority === 'HIGH').length;

    const now = new Date();
    const overdue = tasks.filter(
      (t) => t.due_date && new Date(t.due_date) < now && t.status !== 'DONE'
    ).length;

    return { total, todo, inProgress, done, urgent, overdue };
  }, [tasks, totalCount]);

  const saveTask = useCallback(
    async (values: TaskFormValues, id?: number) => {
      if (id) {
        return await dispatch(updateTask({ id, data: values })).unwrap();
      }
      return await dispatch(createTask(values)).unwrap();
    },
    [dispatch]
  );

  const changeStatus = useCallback(
    async (id: number, newStatus: TaskStatus) => {
      return await dispatch(moveTaskStatus({ id, status: newStatus })).unwrap();
    },
    [dispatch]
  );

  const removeTask = useCallback(
    async (id: number) => {
      return await dispatch(deleteTask(id)).unwrap();
    },
    [dispatch]
  );

  return {
    tasks,
    totalCount,
    status,
    mutationStatus,
    error,
    filters,
    kanban,
    stats,
    isFormOpen,
    selectedTask,
    isDeleteOpen,
    taskToDelete,
    saveTask,
    changeStatus,
    removeTask,
    refresh: () => {
      if (isAuthenticated) {
        dispatch(fetchTasks());
      }
    },
    openCreate: () => dispatch(openCreateModal()),
    openEdit: (t: Task) => dispatch(openEditModal(t)),
    closeForm: () => dispatch(closeFormModal()),
    openDelete: (t: Task) => dispatch(openDeleteModal(t)),
    closeDelete: () => dispatch(closeDeleteModal()),
    setSearchQuery: (q: string) => dispatch(setSearch(q)),
    setStatus: (s: string) => dispatch(setStatusFilter(s)),
    setPriority: (p: string) => dispatch(setPriorityFilter(p)),
    setProject: (p: number | 'ALL') => dispatch(setProjectFilter(p)),
    setAssignee: (a: number | 'ALL' | 'UNASSIGNED') => dispatch(setAssignedFilter(a)),
    setSortOrdering: (o: string) => dispatch(setOrdering(o)),
    setCurrentPage: (p: number) => dispatch(setPage(p)),
    clearFilters: () => dispatch(resetFilters()),
  };
}
