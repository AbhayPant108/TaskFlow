'use client';

import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { useAppSelector } from '@/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Filter } from 'lucide-react';

export function TaskFilters() {
  const { user } = useAuth();
  const { projects } = useProjects();
  const { items: allUsers } = useAppSelector((state) => state.users);
  const {
    filters,
    setSearchQuery,
    setStatus,
    setPriority,
    setProject,
    setAssignee,
    clearFilters,
  } = useTasks();

  const hasActiveFilters =
    filters.search !== '' ||
    filters.status !== 'ALL' ||
    filters.priority !== 'ALL' ||
    filters.project !== 'ALL' ||
    filters.assignedTo !== 'ALL';

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative md:col-span-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            value={filters.search}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Project Filter */}
        <div>
          <select
            value={filters.project}
            onChange={(e) => {
              const val = e.target.value;
              setProject(val === 'ALL' ? 'ALL' : Number(val));
            }}
            className="h-9 w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 cursor-pointer"
          >
            <option value="ALL">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Assignee Filter */}
        <div>
          <select
            value={filters.assignedTo}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'ALL' || val === 'UNASSIGNED') {
                setAssignee(val);
              } else {
                setAssignee(Number(val));
              }
            }}
            className="h-9 w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 cursor-pointer"
          >
            <option value="ALL">All Assignees</option>
            {user && <option value={user.id}>Assigned to Me</option>}
            <option value="UNASSIGNED">Unassigned Only</option>
            {allUsers
              .filter((u) => u.id !== user?.id)
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name || u.email}
                </option>
              ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={filters.status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <select
            value={filters.priority}
            onChange={(e) => setPriority(e.target.value)}
            className="h-9 w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      {/* Active Filter Badges & Reset */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-800 text-xs">
          <span className="text-gray-500 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Filters active
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-6 px-2 text-xs text-red-600 hover:text-red-700 dark:text-red-400"
          >
            <X className="h-3 w-3 mr-1" /> Reset all filters
          </Button>
        </div>
      )}
    </div>
  );
}
