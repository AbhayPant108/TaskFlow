'use client';

import { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { Project } from '@/types/project';
import { Navbar } from '@/components/layout/Navbar';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { ProjectList } from '@/components/projects/ProjectList';
import { ProjectDetailView } from '@/components/projects/ProjectDetailView';
import { ProjectFormDialog } from '@/components/projects/ProjectFormDialog';
import { ProjectMemberDialog } from '@/components/projects/ProjectMemberDialog';
import { ProjectDeleteDialog } from '@/components/projects/ProjectDeleteDialog';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { TaskStats } from '@/components/tasks/TaskStats';
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog';
import { TaskDeleteDialog } from '@/components/tasks/TaskDeleteDialog';
import { TeamDirectory } from '@/components/team/TeamDirectory';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { ProfileDialog } from '@/components/auth/ProfileDialog';

export default function Home() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'projects' | 'tasks' | 'team'>('dashboard');
  const { activeProject, selectProject } = useProjects();
  const { setProject: setTaskProjectFilter } = useTasks();

  const handleSelectProject = (project: Project | null) => {
    selectProject(project);
    if (project) {
      setTaskProjectFilter(project.id);
      setCurrentTab('projects');
    } else {
      setTaskProjectFilter('ALL');
    }
  };

  const handleBackFromProjectDetail = () => {
    selectProject(null);
    setTaskProjectFilter('ALL');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/60 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Interconnected Application Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => {
          if (tab !== 'projects') {
            selectProject(null);
            setTaskProjectFilter('ALL');
          }
          setCurrentTab(tab);
        }}
        onSelectProject={handleSelectProject}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* VIEW 1: DASHBOARD OVERVIEW */}
        {currentTab === 'dashboard' && (
          <DashboardOverview
            onNavigateToProjects={() => setCurrentTab('projects')}
            onNavigateToTasks={() => setCurrentTab('tasks')}
            onNavigateToTeam={() => setCurrentTab('team')}
            onSelectProject={handleSelectProject}
          />
        )}

        {/* VIEW 2: PROJECTS (List or Single Project Detail) */}
        {currentTab === 'projects' && (
          <>
            {activeProject ? (
              <ProjectDetailView
                project={activeProject}
                onBack={handleBackFromProjectDetail}
              />
            ) : (
              <ProjectList onSelectProject={handleSelectProject} />
            )}
          </>
        )}

        {/* VIEW 3: GLOBAL TASKS BOARD & LIST */}
        {currentTab === 'tasks' && (
          <div className="space-y-6">
            <TaskStats />
            <TaskFilters />
            <TaskList />
          </div>
        )}

        {/* VIEW 4: TEAM DIRECTORY */}
        {currentTab === 'team' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                Team Directory
              </h1>
              <p className="text-xs text-gray-500">
                Browse team members, roles, and current task allocations across all workspaces.
              </p>
            </div>
            <TeamDirectory />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/80 bg-white dark:border-gray-800/80 dark:bg-gray-950 py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 TaskFlow Inc. Interconnected Task, Project & User Management.</p>
          <p className="text-gray-400">Next.js • Tailwind CSS • Shadcn UI • Redux Toolkit</p>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <TaskFormDialog />
      <TaskDeleteDialog />
      <ProjectFormDialog />
      <ProjectMemberDialog />
      <ProjectDeleteDialog />
      <AuthDialog />
      <ProfileDialog />
    </div>
  );
}
