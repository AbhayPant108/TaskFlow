'use client';

import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { Project } from '@/types/project';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TaskCard } from '@/components/tasks/TaskCard';
import {
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
  Sparkles,
  Users,
  Layers,
} from 'lucide-react';

interface DashboardOverviewProps {
  onNavigateToProjects: () => void;
  onNavigateToTasks: () => void;
  onNavigateToTeam: () => void;
  onSelectProject: (project: Project) => void;
}

export function DashboardOverview({
  onNavigateToProjects,
  onNavigateToTasks,
  onNavigateToTeam: _onNavigateToTeam,
  onSelectProject,
}: DashboardOverviewProps) {
  const { user, openAuth } = useAuth();
  const { projects, openForm: openProjectForm } = useProjects();
  const { tasks, stats, openCreate: openTaskCreate, openEdit, openDelete, changeStatus } = useTasks();

  // Tasks assigned to current user
  const myTasks = user
    ? tasks.filter((t) => t.assigned_to?.id === user.id)
    : [];

  const myActiveTasks = myTasks.filter((t) => t.status !== 'DONE');

  // Urgent tasks across all projects
  const urgentTasks = tasks
    .filter((t) => (t.priority === 'URGENT' || t.priority === 'HIGH') && t.status !== 'DONE')
    .slice(0, 4);

  // Active projects
  const activeProjects = projects.filter((p) => p.status === 'ACTIVE').slice(0, 3);

  const globalCompletionRate =
    tasks.length > 0 ? Math.round((stats.done / tasks.length) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>TaskFlow Unified Workspace</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {user ? `Welcome back, ${user.first_name || user.email.split('@')[0]}!` : 'Welcome to TaskFlow!'}
            </h1>

            <p className="text-sm text-indigo-100 max-w-xl">
              Projects, team members, and tasks are bound together. Track milestones, assign
              responsibilities, and manage project workflows in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={openTaskCreate}
              className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold shadow-md text-xs h-9"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Create Task
            </Button>
            <Button
              onClick={() => openProjectForm(null)}
              variant="outline"
              className="bg-indigo-500/30 text-white border-white/20 hover:bg-indigo-500/40 text-xs h-9"
            >
              <Plus className="h-4 w-4 mr-1.5" /> New Project
            </Button>
            {!user && (
              <Button
                onClick={() => openAuth('login')}
                className="bg-amber-400 text-gray-900 hover:bg-amber-300 font-semibold text-xs h-9"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Subtle decorative circles */}
        <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-32 -bottom-12 h-36 w-36 rounded-full bg-purple-500/20 pointer-events-none" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Active Projects
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {projects.filter((p) => p.status === 'ACTIVE').length}
              </p>
              <p className="text-[11px] text-gray-400">
                {projects.length} total projects
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <FolderKanban className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Total Tasks
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {tasks.length}
              </p>
              <p className="text-[11px] text-gray-400">
                {stats.todo} to do, {stats.inProgress} active
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Assigned To You
              </p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {user ? myActiveTasks.length : '—'}
              </p>
              <p className="text-[11px] text-gray-400">
                {user ? `${myTasks.filter((t) => t.status === 'DONE').length} completed` : 'Log in to view'}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Overall Completion
              </p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {globalCompletionRate}%
              </p>
              <p className="text-[11px] text-gray-400">
                {stats.done} of {tasks.length} tasks done
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Projects Showcase & Urgent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-indigo-600" /> Active Projects
              </h2>
              <p className="text-xs text-gray-500">
                Workspaces currently in progress with active tasks.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateToProjects}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 p-0 h-auto flex items-center gap-1"
            >
              View all ({projects.length}) <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeProjects.map((p) => {
              const pTasks = tasks.filter((t) => t.project === p.id);
              const pCompleted = pTasks.filter((t) => t.status === 'DONE').length;
              const rate = pTasks.length > 0 ? Math.round((pCompleted / pTasks.length) * 100) : 0;

              return (
                <Card
                  key={p.id}
                  onClick={() => onSelectProject(p)}
                  className="group relative cursor-pointer overflow-hidden border border-gray-200 transition-all hover:shadow-md hover:border-gray-300 dark:border-gray-800"
                >
                  <div
                    className="h-1.5 w-full"
                    style={{ backgroundColor: p.color || '#3B82F6' }}
                  />
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: p.color || '#3B82F6' }}
                        />
                        <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 transition-colors">
                          {p.name}
                        </h3>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {p.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                      {p.description || 'No description.'}
                    </p>
                  </CardHeader>

                  <CardContent className="p-4 pt-1 space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>Completion ({pCompleted}/{pTasks.length} tasks)</span>
                        <span className="font-semibold">{rate}%</span>
                      </div>
                      <Progress value={rate} indicatorColor="bg-indigo-600" />
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Users className="h-3 w-3 text-gray-400" />
                        {p.members_count + 1} members
                      </span>
                      <span className="text-[11px] text-indigo-600 font-medium group-hover:underline flex items-center gap-0.5">
                        Open <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Col: High Priority & Overdue Tasks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-500" /> High Priority Tasks
              </h2>
              <p className="text-xs text-gray-500">Needs prompt review or delivery.</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateToTasks}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 p-0 h-auto flex items-center gap-1"
            >
              All tasks <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="space-y-3">
            {urgentTasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-xs text-gray-400 dark:border-gray-800">
                No high priority tasks right now. Great job!
              </div>
            ) : (
              urgentTasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onEdit={openEdit}
                  onDelete={openDelete}
                  onStatusChange={changeStatus}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
