'use client';

import { useState } from 'react';
import { Project } from '@/types/project';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { TaskCard } from '@/components/tasks/TaskCard';
import {
  ArrowLeft,
  Plus,
  Users,
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  UserMinus,
  LayoutGrid,
} from 'lucide-react';

interface ProjectDetailViewProps {
  project: Project;
  onBack: () => void;
}

export function ProjectDetailView({ project, onBack }: ProjectDetailViewProps) {
  const { user } = useAuth();
  const {
    openForm,
    openMemberDialog,
    openDeleteDialog,
    changeRole,
    removeMember,
  } = useProjects();
  const { tasks, openCreate, openEdit, openDelete, changeStatus } = useTasks();

  const [activeTab, setActiveTab] = useState<'board' | 'members' | 'settings'>('board');

  // Filter tasks to this project
  const projectTasks = tasks.filter((t) => t.project === project.id);
  const todoTasks = projectTasks.filter((t) => t.status === 'TODO');
  const inProgressTasks = projectTasks.filter((t) => t.status === 'IN_PROGRESS');
  const doneTasks = projectTasks.filter((t) => t.status === 'DONE');

  const totalTasks = projectTasks.length;
  const completedTasks = doneTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const isOwner = user?.id === project.owner?.id || project.current_user_role === 'OWNER';
  const isAdmin = project.current_user_role === 'ADMIN' || isOwner || user?.role === 'ADMIN';

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await changeRole(project.id, userId, newRole);
    } catch {
      // error handled
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (confirm('Are you sure you want to remove this member from the project?')) {
      await removeMember(project.id, userId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </Button>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={openMemberDialog}
              className="text-xs flex items-center gap-1.5"
            >
              <Users className="h-3.5 w-3.5" /> Invite Member
            </Button>
          )}

          <Button
            size="sm"
            onClick={openCreate}
            className="text-xs flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Add Task
          </Button>

          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openForm(project)}>
                  <Edit2 className="h-4 w-4 mr-2" /> Edit Project
                </DropdownMenuItem>
                <DropdownMenuItem
                  destructive
                  onClick={() => openDeleteDialog(project)}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Project Banner Header */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: project.color || '#3B82F6' }}
              />
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                {project.name}
              </h1>
              <Badge variant="outline" className="font-semibold text-xs">
                {project.status}
              </Badge>
              {project.current_user_role && (
                <Badge variant="secondary" className="text-xs">
                  Role: {project.current_user_role}
                </Badge>
              )}
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
              {project.description || 'No description provided for this project.'}
            </p>

            {/* Timeline & Owner */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400">Owner:</span>
                <Avatar
                  src={project.owner?.avatar}
                  fallback={project.owner?.full_name || project.owner?.email}
                  size="xs"
                />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {project.owner?.full_name || project.owner?.email}
                </span>
              </div>

              {(project.start_date || project.end_date) && (
                <div className="flex items-center gap-1 text-gray-500">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Start'}
                    {' → '}
                    {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Ongoing'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shrink-0">
            <div className="text-center px-2">
              <p className="text-xs text-gray-500">Total Tasks</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{totalTasks}</p>
            </div>
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
            <div className="text-center px-2">
              <p className="text-xs text-gray-500">Completed</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{completedTasks}</p>
            </div>
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
            <div className="text-center px-2">
              <p className="text-xs text-gray-500">Completion</p>
              <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{completionRate}%</p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span>Overall Task Completion Rate</span>
            <span>{completionRate}%</span>
          </div>
          <Progress
            value={completionRate}
            indicatorColor={completionRate === 100 ? 'bg-emerald-600' : 'bg-indigo-600'}
          />
        </div>
      </div>

      {/* Tabs: Kanban Board, Team Members, Settings */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as 'board' | 'members' | 'settings')}
      >
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="board" className="flex items-center gap-1.5 text-xs">
            <LayoutGrid className="h-4 w-4" /> Board & Tasks ({totalTasks})
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-1.5 text-xs">
            <Users className="h-4 w-4" /> Team Members ({(project.memberships?.length || 0) + 1})
          </TabsTrigger>
          {isOwner && (
            <TabsTrigger value="settings" className="flex items-center gap-1.5 text-xs">
              <Edit2 className="h-4 w-4" /> Settings
            </TabsTrigger>
          )}
        </TabsList>

        {/* TAB 1: KANBAN BOARD */}
        <TabsContent value="board" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            {/* Column 1: To Do */}
            <div className="rounded-xl bg-gray-100/70 p-3.5 border border-gray-200/70 dark:bg-gray-900/60 dark:border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    To Do
                  </h3>
                  <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {todoTasks.length}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={openCreate}
                  className="h-6 w-6 text-gray-500 hover:text-gray-900"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="space-y-2.5 min-h-[150px]">
                {todoTasks.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-xs text-gray-500 dark:border-gray-800">
                    No tasks to do
                  </div>
                ) : (
                  todoTasks.map((t) => (
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

            {/* Column 2: In Progress */}
            <div className="rounded-xl bg-gray-100/70 p-3.5 border border-gray-200/70 dark:bg-gray-900/60 dark:border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    In Progress
                  </h3>
                  <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {inProgressTasks.length}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={openCreate}
                  className="h-6 w-6 text-gray-500 hover:text-gray-900"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="space-y-2.5 min-h-[150px]">
                {inProgressTasks.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-xs text-gray-500 dark:border-gray-800">
                    No tasks in progress
                  </div>
                ) : (
                  inProgressTasks.map((t) => (
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

            {/* Column 3: Done */}
            <div className="rounded-xl bg-gray-100/70 p-3.5 border border-gray-200/70 dark:bg-gray-900/60 dark:border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Done
                  </h3>
                  <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {doneTasks.length}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={openCreate}
                  className="h-6 w-6 text-gray-500 hover:text-gray-900"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="space-y-2.5 min-h-[150px]">
                {doneTasks.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-xs text-gray-500 dark:border-gray-800">
                    No completed tasks yet
                  </div>
                ) : (
                  doneTasks.map((t) => (
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
        </TabsContent>

        {/* TAB 2: TEAM MEMBERS */}
        <TabsContent value="members" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Project Team</h3>
              <p className="text-xs text-gray-500">
                Members collaborate on tasks and milestone objectives.
              </p>
            </div>
            {isAdmin && (
              <Button size="sm" onClick={openMemberDialog} className="text-xs flex items-center gap-1.5">
                <Plus className="h-4 w-4" /> Add Member
              </Button>
            )}
          </div>

          <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-sm dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
            {/* Project Owner Row */}
            <div className="flex items-center justify-between p-4 bg-indigo-50/30 dark:bg-indigo-950/20">
              <div className="flex items-center gap-3">
                <Avatar
                  src={project.owner?.avatar}
                  fallback={project.owner?.full_name || project.owner?.email}
                  size="md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                      {project.owner?.full_name || project.owner?.email}
                    </span>
                    <Badge variant="default" className="text-[10px] bg-indigo-600">
                      Project Owner
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">{project.owner?.email}</p>
                </div>
              </div>
              <span className="text-xs text-gray-400 font-medium">Creator</span>
            </div>

            {/* Memberships List */}
            {(!project.memberships || project.memberships.length === 0) ? (
              <div className="p-8 text-center text-xs text-gray-500">
                No additional team members joined yet.{' '}
                {isAdmin && 'Click "Add Member" to invite colleagues.'}
              </div>
            ) : (
              project.memberships.map((membership) => {
                const memberUser = membership.user;
                const canManageThisUser = isOwner || (isAdmin && membership.role !== 'ADMIN');
                const isSelf = user?.id === memberUser?.id;

                return (
                  <div
                    key={membership.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={memberUser?.avatar}
                        fallback={memberUser?.full_name || memberUser?.email}
                        size="md"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                            {memberUser?.full_name || memberUser?.email}
                          </span>
                          <Badge
                            variant={
                              membership.role === 'ADMIN'
                                ? 'default'
                                : membership.role === 'MEMBER'
                                ? 'secondary'
                                : 'outline'
                            }
                            className="text-[10px]"
                          >
                            {membership.role}
                          </Badge>
                          {isSelf && (
                            <span className="text-[11px] text-gray-400 font-normal">(You)</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{memberUser?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Role Changer (Owner only) */}
                      {isOwner && (
                        <select
                          value={membership.role}
                          onChange={(e) => handleRoleChange(memberUser.id, e.target.value)}
                          className="h-8 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 cursor-pointer"
                        >
                          <option value="MEMBER">Member</option>
                          <option value="ADMIN">Admin</option>
                          <option value="VIEWER">Viewer</option>
                        </select>
                      )}

                      {/* Remove / Leave Button */}
                      {(canManageThisUser || isSelf) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(memberUser.id)}
                          className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                        >
                          <UserMinus className="h-3.5 w-3.5 mr-1" />
                          {isSelf ? 'Leave Project' : 'Remove'}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* TAB 3: SETTINGS */}
        {isOwner && (
          <TabsContent value="settings" className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  Project Administration
                </h3>
                <p className="text-xs text-gray-500">
                  Manage core metadata or delete this project.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openForm(project)}
                  className="text-xs flex items-center gap-1.5"
                >
                  <Edit2 className="h-4 w-4" /> Edit Project Metadata
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => openDeleteDialog(project)}
                  className="text-xs flex items-center gap-1.5"
                >
                  <Trash2 className="h-4 w-4" /> Delete Project Permanently
                </Button>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
