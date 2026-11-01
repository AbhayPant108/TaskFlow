'use client';

import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { TaskBoardView } from './TaskBoardView';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import {
  LayoutGrid,
  List,
  Loader2,
  AlertCircle,
  MoreVertical,
  Edit2,
  Trash2,
  Plus,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

export function TaskList() {
  const {
    tasks,
    status,
    openCreate,
    openEdit,
    openDelete,
    changeStatus,
    filters,
  } = useTasks();

  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  const isLoading = status === 'loading';

  return (
    <div className="space-y-4">
      {/* Top Header: Count & View Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
            Tasks Explorer
          </h2>
          <span className="text-xs text-gray-500 font-medium">
            ({tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} shown)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-gray-200 bg-white p-0.5 dark:border-gray-800 dark:bg-gray-900">
            <button
              type="button"
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                viewMode === 'board'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Board
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400'
              }`}
            >
              <List className="h-3.5 w-3.5" /> List
            </button>
          </div>

          <Button size="sm" onClick={openCreate} className="text-xs flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> New Task
          </Button>
        </div>
      </div>

      {/* Content Rendering */}
      {isLoading && tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-gray-500">
          <Loader2 className="h-6 w-6 animate-spin mb-2 text-indigo-600" />
          <p className="text-xs">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-800 space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
            <List className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            No tasks found
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {filters.search || filters.status !== 'ALL' || filters.project !== 'ALL'
              ? 'No tasks match your active filter settings. Try clearing filters.'
              : 'Create a task to get work done with your team!'}
          </p>
          <Button size="sm" onClick={openCreate} className="text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" /> Create Task
          </Button>
        </div>
      ) : viewMode === 'board' ? (
        <TaskBoardView
          tasks={tasks}
          onEdit={openEdit}
          onDelete={openDelete}
          onStatusChange={changeStatus}
          onAddNew={openCreate}
        />
      ) : (
        /* TABLE / LIST VIEW */
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50/75 dark:bg-gray-800/60 text-gray-500 font-semibold border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-4 py-3">Task Title</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Assignee</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {tasks.map((task) => {
                const isOverdue =
                  task.due_date && new Date(task.due_date) < new Date() && task.status !== 'DONE';

                return (
                  <tr
                    key={task.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: task.project_color || '#3B82F6' }}
                        />
                        <span
                          onClick={() => openEdit(task)}
                          className={`font-semibold text-gray-900 dark:text-gray-100 hover:text-indigo-600 cursor-pointer ${
                            task.status === 'DONE' ? 'line-through text-gray-400' : ''
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
                        {task.project_name}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <select
                        value={task.status}
                        onChange={(e) => changeStatus(task.id, e.target.value as any)}
                        className="rounded border border-gray-200 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800 font-medium cursor-pointer"
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </select>
                    </td>

                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          task.priority === 'URGENT'
                            ? 'destructive'
                            : task.priority === 'HIGH'
                            ? 'default'
                            : 'secondary'
                        }
                        className="text-[10px]"
                      >
                        {task.priority}
                      </Badge>
                    </td>

                    <td className="px-4 py-3">
                      {task.assigned_to ? (
                        <div className="flex items-center gap-1.5">
                          <Avatar
                            src={task.assigned_to.avatar}
                            fallback={task.assigned_to.full_name || task.assigned_to.email}
                            size="xs"
                          />
                          <span className="truncate max-w-[100px]">
                            {task.assigned_to.first_name || task.assigned_to.email.split('@')[0]}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {task.due_date ? (
                        <span
                          className={`flex items-center gap-1 ${
                            isOverdue ? 'text-red-600 font-semibold' : 'text-gray-500'
                          }`}
                        >
                          {isOverdue && <AlertCircle className="h-3.5 w-3.5" />}
                          {new Date(task.due_date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(task)}>
                            <Edit2 className="h-3.5 w-3.5 mr-2" /> Edit Task
                          </DropdownMenuItem>
                          <DropdownMenuItem destructive onClick={() => openDelete(task)}>
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
