'use client';

import { useProjects } from '@/hooks/useProjects';
import { Project } from '@/types/project';
import { ProjectCard } from './ProjectCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search, FolderKanban, Loader2 } from 'lucide-react';

interface ProjectListProps {
  onSelectProject: (project: Project) => void;
}

export function ProjectList({ onSelectProject }: ProjectListProps) {
  const {
    projects,
    status,
    filters,
    openForm,
    openDeleteDialog,
    setSearch,
    setStatusFilter,
  } = useProjects();

  const statuses = [
    { key: 'ALL', label: 'All Projects' },
    { key: 'ACTIVE', label: 'Active' },
    { key: 'PLANNING', label: 'Planning' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'ARCHIVED', label: 'Archived' },
  ];

  return (
    <div className="space-y-6">
      {/* Controls: Search, Status Filters, & Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {statuses.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setStatusFilter(s.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filters.status === s.key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              {s.label}
            </button>
          ))}

          <Button
            size="sm"
            onClick={() => openForm(null)}
            className="text-xs flex items-center gap-1.5 ml-auto sm:ml-2"
          >
            <Plus className="h-4 w-4" /> New Project
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      {status === 'loading' && projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-gray-500">
          <Loader2 className="h-6 w-6 animate-spin mb-2 text-indigo-600" />
          <p className="text-xs">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-800 space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
            <FolderKanban className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            No projects found
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {filters.search || filters.status !== 'ALL'
              ? 'Try adjusting your search query or filter settings.'
              : 'Create your first project to start grouping tasks and assigning team members.'}
          </p>
          <Button size="sm" onClick={() => openForm(null)} className="text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" /> Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={onSelectProject}
              onEdit={openForm}
              onDelete={openDeleteDialog}
            />
          ))}
        </div>
      )}
    </div>
  );
}
