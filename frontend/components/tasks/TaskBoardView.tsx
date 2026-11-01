'use client';

import { Task, TaskStatus } from '@/types/task';
import { TaskCard } from './TaskCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface TaskBoardViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (id: number, status: TaskStatus) => void;
  onAddNew: () => void;
}

export function TaskBoardView({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  onAddNew,
}: TaskBoardViewProps) {
  const columns: Array<{
    id: TaskStatus;
    title: string;
    dotColor: string;
    bgColor: string;
  }> = [
    {
      id: 'TODO',
      title: 'To Do',
      dotColor: 'bg-slate-400',
      bgColor: 'bg-slate-50 dark:bg-gray-900/40',
    },
    {
      id: 'IN_PROGRESS',
      title: 'In Progress',
      dotColor: 'bg-amber-500',
      bgColor: 'bg-amber-50/30 dark:bg-amber-950/20',
    },
    {
      id: 'DONE',
      title: 'Done',
      dotColor: 'bg-emerald-500',
      bgColor: 'bg-emerald-50/30 dark:bg-emerald-950/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            className="rounded-xl border border-gray-200/80 bg-gray-50/60 p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/60 space-y-3"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${col.dotColor}`} />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  {col.title}
                </h3>
                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {colTasks.length}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onAddNew}
                className="h-7 w-7 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Task Cards Column */}
            <div className="space-y-3 min-h-[160px]">
              {colTasks.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-xs text-gray-400 dark:border-gray-800">
                  No tasks in {col.title.toLowerCase()}
                </div>
              ) : (
                colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
