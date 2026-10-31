import { TaskHeader } from '@/components/tasks/TaskHeader';
import { TaskStats } from '@/components/tasks/TaskStats';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog';
import { TaskDeleteDialog } from '@/components/tasks/TaskDeleteDialog';

export default function Home() {
  return (
    <main className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header section with branding & Create Task button */}
      <TaskHeader />

      {/* Quick metrics / stats cards */}
      <TaskStats />

      {/* Filter and search controls */}
      <TaskFilters />

      {/* Tasks grid / list view */}
      <TaskList />

      {/* Modals for Create/Edit and Delete */}
      <TaskFormDialog />
      <TaskDeleteDialog />
    </main>
  );
}
