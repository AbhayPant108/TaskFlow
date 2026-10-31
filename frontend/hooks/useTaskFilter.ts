import { useState, useEffect, useRef } from 'react';
import { useDebounce } from './useDebounce';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  setStatusFilter,
  setPriorityFilter,
  setOrdering,
  resetFilters as resetReduxFilters,
  fetchTasks,
  setLoadingState,
} from '@/store/taskSlice';

export interface TaskFilterValues {
  status: string;
  priority: string;
  ordering: string;
}

/**
 * Custom hook for task filters (status, priority, ordering) with debouncing and safe reset handling.
 *
 * @param delay Milliseconds to debounce the filter changes (default: 250ms)
 */
export function useTaskFilter(delay: number = 250) {
  const dispatch = useAppDispatch();
  const reduxFilters = useAppSelector((state) => state.tasks.filters);
  const reduxStatus = useAppSelector((state) => state.tasks.status);

  // Local filter state before debounce
  const [localFilters, setLocalFilters] = useState<TaskFilterValues>({
    status: reduxFilters.status,
    priority: reduxFilters.priority,
    ordering: reduxFilters.ordering,
  });

  const debouncedFilters = useDebounce(localFilters, delay);

  const isResettingRef = useRef(false);
  const isFilterActiveRef = useRef(false);
  const isInitialMount = useRef(true);

  // Sync local filters if Redux filters were changed externally
  useEffect(() => {
    if (!isFilterActiveRef.current) {
      setLocalFilters({
        status: reduxFilters.status,
        priority: reduxFilters.priority,
        ordering: reduxFilters.ordering,
      });
    }
  }, [reduxFilters.status, reduxFilters.priority, reduxFilters.ordering]);

  // Check if user has changed a filter and is waiting for the debounce delay
  const isDebouncing =
    !isResettingRef.current &&
    (localFilters.status !== debouncedFilters.status ||
      localFilters.priority !== debouncedFilters.priority ||
      localFilters.ordering !== debouncedFilters.ordering);

  useEffect(() => {
    if (isDebouncing) {
      isFilterActiveRef.current = true;
      dispatch(setLoadingState('loading'));
    }
  }, [isDebouncing, dispatch]);

  useEffect(() => {
    if (reduxStatus !== 'loading') {
      isFilterActiveRef.current = false;
      isResettingRef.current = false;
    }
  }, [reduxStatus]);

  // When debounce delay elapses and debouncedFilters update, dispatch changes and call API
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (isResettingRef.current) {
      if (
        debouncedFilters.status === 'ALL' &&
        debouncedFilters.priority === 'ALL' &&
        debouncedFilters.ordering === '-created_at'
      ) {
        isResettingRef.current = false;
      }
      return;
    }

    let hasChanges = false;
    if (debouncedFilters.status !== reduxFilters.status) {
      dispatch(setStatusFilter(debouncedFilters.status));
      hasChanges = true;
    }
    if (debouncedFilters.priority !== reduxFilters.priority) {
      dispatch(setPriorityFilter(debouncedFilters.priority));
      hasChanges = true;
    }
    if (debouncedFilters.ordering !== reduxFilters.ordering) {
      dispatch(setOrdering(debouncedFilters.ordering));
      hasChanges = true;
    }

    if (hasChanges) {
      isFilterActiveRef.current = true;
      dispatch(fetchTasks());
    }
  }, [debouncedFilters]); // Depend ONLY on debouncedFilters to avoid loops on external reset!

  const setStatus = (newStatus: string) => {
    setLocalFilters((prev) => ({ ...prev, status: newStatus }));
  };

  const setPriority = (newPriority: string) => {
    setLocalFilters((prev) => ({ ...prev, priority: newPriority }));
  };

  const setOrderingValue = (newOrdering: string) => {
    setLocalFilters((prev) => ({ ...prev, ordering: newOrdering }));
  };

  const resetFilters = () => {
    isResettingRef.current = true;
    isFilterActiveRef.current = false;
    setLocalFilters({
      status: 'ALL',
      priority: 'ALL',
      ordering: '-created_at',
    });
    dispatch(resetReduxFilters());
    dispatch(fetchTasks());
  };

  const hasActiveFilters =
    reduxFilters.search !== '' ||
    localFilters.status !== 'ALL' ||
    localFilters.priority !== 'ALL' ||
    localFilters.ordering !== '-created_at';

  const isFilterLoading = isDebouncing || (isFilterActiveRef.current && reduxStatus === 'loading');

  return {
    filters: localFilters,
    setStatus,
    setPriority,
    setOrdering: setOrderingValue,
    resetFilters,
    status: isFilterLoading ? 'loading' : reduxStatus,
    isLoading: isFilterLoading,
    isFilterLoading,
    isDebouncing,
    hasActiveFilters,
  };
}
