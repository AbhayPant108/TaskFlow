'use client';

import { Project } from '@/types/project';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Calendar,
  Users,
  CheckCircle,
  MoreVertical,
  Edit2,
  Trash2,
  ArrowRight,
  FolderKanban,
} from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

const statusVariants: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  PLANNING: { label: 'Planning', variant: 'secondary' },
  ACTIVE: { label: 'Active', variant: 'default' },
  COMPLETED: { label: 'Completed', variant: 'outline' },
  ARCHIVED: { label: 'Archived', variant: 'secondary' },
};

export function ProjectCard({ project, onSelect, onEdit, onDelete }: ProjectCardProps) {
  const statusInfo = statusVariants[project.status] || {
    label: project.status,
    variant: 'secondary',
  };

  const tasksCount = project.tasks_count || 0;
  const completedCount = project.completed_tasks_count || 0;
  const progressPercent = tasksCount > 0 ? Math.round((completedCount / tasksCount) * 100) : 0;

  const isOwner = project.current_user_role === 'OWNER';
  const isAdminOrOwner = isOwner || project.current_user_role === 'ADMIN';

  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 flex flex-col justify-between">
      {/* Color Top Border Accent */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: project.color || '#3B82F6' }}
      />

      <CardHeader className="pb-3 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: project.color || '#3B82F6' }}
            />
            <h3
              onClick={() => onSelect(project)}
              className="font-bold text-base text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer line-clamp-1"
            >
              {project.name}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant={statusInfo.variant} className="text-[11px] font-medium">
              {statusInfo.label}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-gray-700">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onSelect(project)}>
                  <FolderKanban className="h-4 w-4 mr-2" /> View Board & Tasks
                </DropdownMenuItem>
                {isAdminOrOwner && (
                  <DropdownMenuItem onClick={() => onEdit(project)}>
                    <Edit2 className="h-4 w-4 mr-2" /> Edit Project
                  </DropdownMenuItem>
                )}
                {isOwner && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      destructive
                      onClick={() => onDelete(project)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete Project
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 min-h-[32px]">
          {project.description || 'No description provided.'}
        </p>
      </CardHeader>

      <CardContent className="space-y-4 pb-3">
        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 font-medium">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              Progress
            </span>
            <span>
              {completedCount}/{tasksCount} tasks ({progressPercent}%)
            </span>
          </div>
          <Progress
            value={progressPercent}
            indicatorColor={progressPercent === 100 ? 'bg-emerald-600' : 'bg-indigo-600'}
          />
        </div>

        {/* Project Meta Details */}
        <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 dark:text-gray-400 gap-2 pt-1 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-gray-400" />
            <span>
              {project.members_count + 1} {project.members_count + 1 === 1 ? 'member' : 'members'}
            </span>
          </div>

          {(project.start_date || project.end_date) && (
            <div className="flex items-center gap-1.5 text-gray-500">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              <span>
                {project.end_date
                  ? `Due ${new Date(project.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
                  : 'In progress'}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Avatar
            src={project.owner?.avatar}
            fallback={project.owner?.full_name || project.owner?.email || 'Owner'}
            size="xs"
          />
          <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[120px]">
            {project.owner?.first_name || project.owner?.email}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSelect(project)}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 p-0 h-auto flex items-center gap-1"
        >
          Open Workspace <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
}
