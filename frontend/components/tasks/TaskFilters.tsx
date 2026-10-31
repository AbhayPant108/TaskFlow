'use client';

import { useTaskSearch, useTaskFilter } from '@/hooks';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RotateCcw, Loader2 } from 'lucide-react';

export function TaskFilters() {
  // Hook for task search with debouncing and safe reset
  const {
    searchTerm,
    setSearchTerm,
    resetSearch,
    isSearchLoading,
  } = useTaskSearch(350);

  // Hook for task filters (status, priority, ordering) with debouncing and safe reset
  const {
    filters,
    setStatus,
    setPriority,
    setOrdering,
    resetFilters,
    isFilterLoading,
    hasActiveFilters,
  } = useTaskFilter(250);

  // Coordinated reset that cleanly clears both search input and filter dropdowns
  const handleReset = () => {
    resetSearch();
    resetFilters();
  };

  // Reset button shows if any filter dropdown is non-default OR search input has text
  const isAnyFilterActive = hasActiveFilters || searchTerm.trim() !== '';

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search bar with stable fixed width (flex-shrink-0) so its size never changes */}
        <div className="relative w-full lg:w-96 flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks by title or description..."
            className="pl-9 pr-9 w-full"
          />
          {/* Search loading spinner */}
          {isSearchLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
            </div>
          )}
        </div>

        {/* Filter Dropdowns and Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={isFilterLoading}
            className="h-9 rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="ALL">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority}
            onChange={(e) => setPriority(e.target.value)}
            disabled={isFilterLoading}
            className="h-9 rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          {/* Sort Ordering */}
          <select
            value={filters.ordering}
            onChange={(e) => setOrdering(e.target.value)}
            disabled={isFilterLoading}
            className="h-9 rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="-created_at">Newest First</option>
            <option value="created_at">Oldest First</option>
            <option value="due_date">Due Date (Earliest)</option>
            <option value="-due_date">Due Date (Latest)</option>
            <option value="title">Title (A-Z)</option>
          </select>

          {/* Dedicated Filter Loader */}
          {isFilterLoading && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 animate-pulse">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
              <span>Filtering...</span>
            </span>
          )}

          {/* Reset Filters button */}
          {isAnyFilterActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={isFilterLoading || isSearchLoading}
              className="gap-1 text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
