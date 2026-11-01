'use client';

import { Task, TaskStatus } from '@/types/task';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  MoreVertical,
  Edit2,
  Trash2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange?: (id: number, status: TaskStatus) => void;
}

const priorityConfig: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; dotColor: string }
> = {
  LOW: { label: 'Low', variant: 'secondary', dotColor: 'bg-slate-400' },
  MEDIUM: { label: 'Medium', variant: 'outline', dotColor: 'bg-blue-500' },
  HIGH: { label: 'High', variant: 'default', dotColor: 'bg-amber-500' },
  URGENT: { label: 'Urgent', variant: 'destructive', dotColor: 'bg-red-500' },
};

const statusConfig: Record<
  TaskStatus,
  { label: string; nextStatus: TaskStatus | null; nextLabel: string }
> = {
  TODO: { label: 'To Do', nextStatus: 'IN_PROGRESS', nextLabel: 'Start Task' },
  IN_PROGRESS: { label: 'In Progress', nextStatus: 'DONE', nextLabel: 'Mark Done' },
  DONE: { label: 'Done', nextStatus: 'TODO', nextLabel: 'Reopen' },
};

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const priorityInfo = priorityConfig[task.priority] || priorityConfig.MEDIUM;
  const statusInfo = statusConfig[task.status] || statusConfig.TODO;

  // Due date calculation
  const isOverdue =
    task.due_date && new Date(task.due_date) < new Date() && task.status !== 'DONE';

  const formatDueDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <Card className="group relative transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Accent left border using project color */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: task.project_color || '#3B82F6' }}
      />

      <CardHeader className="p-3.5 pb-2 pl-4">
        {/* Top line: Project Pill & Priority & Actions */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: task.project_color || '#3B82F6' }}
              />
              <span className="truncate max-w-[130px]">{task.project_name}</span>
            </span>

            <Badge variant={priorityInfo.variant} className="text-[10px] py-0 px-1.5 h-5">
              {priorityInfo.label}
            </Badge>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit2 className="h-3.5 w-3.5 mr-2" /> Edit Task
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onClick={() => onDelete(task)}>
                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Task Title */}
        <h4
          onClick={() => onEdit(task)}
          className={`font-semibold text-sm mt-2 text-gray-900 dark:text-gray-100 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 ${
            task.status === 'DONE' ? 'line-through text-gray-400 dark:text-gray-500' : ''
          }`}
        >
          {task.title}
        </h4>

        {task.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
            {task.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="p-3.5 pt-1 pl-4 pb-2">
        <div className="flex items-center justify-between text-xs text-gray-500 gap-2">
          {/* Due date */}
          {task.due_date ? (
            <div
              className={`flex items-center gap-1 font-medium ${
                isOverdue
                  ? 'text-red-600 dark:text-red-400 font-semibold'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {isOverdue ? (
                <AlertCircle className="h-3.5 w-3.5" />
              ) : (
                <Calendar className="h-3.5 w-3.5" />
              )}
              <span>{formatDueDate(task.due_date)}</span>
              {isOverdue && <span className="text-[10px] uppercase font-bold">(Overdue)</span>}
            </div>
          ) : (
            <span className="text-[11px] text-gray-400">No due date</span>
          )}

          {/* Assignee Avatar */}
          <div className="flex items-center gap-1.5 shrink-0">
            {task.assigned_to ? (
              <div
                className="flex items-center gap-1"
                title={`Assigned to ${task.assigned_to.full_name || task.assigned_to.email}`}
              >
                <Avatar
                  src={task.assigned_to.avatar}
                  fallback={task.assigned_to.full_name || task.assigned_to.email}
                  size="xs"
                />
                <span className="text-[11px] text-gray-600 dark:text-gray-300 font-medium truncate max-w-[80px]">
                  {task.assigned_to.first_name || task.assigned_to.email.split('@')[0]}
                </span>
              </div>
            ) : (
              <span className="text-[10px] text-gray-400 italic">Unassigned</span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-3.5 pt-2 pl-4 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
        <span className="text-[10px] text-gray-400">
          {new Date(task.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </span>

        {onStatusChange && statusInfo.nextStatus && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onStatusChange(task.id, statusInfo.nextStatus!)}
            className="h-6 px-2 text-[11px] font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
          >
            {task.status === 'IN_PROGRESS' ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <ArrowRight className="h-3 w-3" />
            )}
            {statusInfo.nextLabel}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
