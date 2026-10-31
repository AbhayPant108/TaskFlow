'use client';

import { Task, TaskStatus } from '@/types/task';
import { Card, CardContent } from '@/components/ui/card';
import { PriorityBadge, StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/store';
import { openEditModal, openDeleteModal, updateTask } from '@/store/taskSlice';
import { Calendar, Clock, Edit2, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function TaskCard({ task }: { task: Task }) {
  const dispatch = useAppDispatch();

  const handleQuickStatusChange = (newStatus: TaskStatus) => {
    if (newStatus !== task.status) {
      dispatch(updateTask({ id: task.id, data: { status: newStatus } }));
    }
  };

  const isOverdue =
    task.due_date &&
    task.status !== 'DONE' &&
    new Date(task.due_date).getTime() < new Date().getTime();

  const formattedDueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <Card className="hover:shadow-md transition-all border border-gray-200 dark:border-gray-800 flex flex-col justify-between">
      <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
        {/* Top Badges & Actions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={task.status} />
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => dispatch(openEditModal(task))}
                className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                title="Edit task"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => dispatch(openDeleteModal(task))}
                className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                title="Delete task"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Title & Description */}
          <div>
            <h3
              className={`text-base font-semibold text-gray-900 dark:text-gray-100 ${
                task.status === 'DONE' ? 'line-through text-gray-400 dark:text-gray-500' : ''
              }`}
            >
              {task.title}
            </h3>
            {task.description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-3 whitespace-pre-line">
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Footer: Due date & Quick Status Selector */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2 text-xs">
          {formattedDueDate ? (
            <div
              className={`flex items-center gap-1 font-medium ${
                isOverdue
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {isOverdue ? (
                <AlertTriangle className="h-3.5 w-3.5" />
              ) : (
                <Calendar className="h-3.5 w-3.5" />
              )}
              <span>{formattedDueDate}</span>
              {isOverdue && <span className="font-semibold text-xs ml-0.5">(Overdue)</span>}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-gray-400">
              <Clock className="h-3.5 w-3.5" />
              <span>No due date</span>
            </div>
          )}

          {/* Quick status dropdown */}
          <select
            value={task.status}
            onChange={(e) => handleQuickStatusChange(e.target.value as TaskStatus)}
            className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>
      </CardContent>
    </Card>
  );
}
