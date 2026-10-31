import { useState, useEffect, useRef } from 'react';
import { useDebounce } from './useDebounce';
import { useAppDispatch, useAppSelector } from '@/store';
import { setSearch, fetchTasks, setLoadingState } from '@/store/taskSlice';

/**
 * Custom hook for task searching with debouncing and safe reset handling.
 *
 * @param delay Milliseconds to debounce the search (default: 350ms)
 */
export function useTaskSearch(delay: number = 350) {
  const dispatch = useAppDispatch();
  const reduxFilters = useAppSelector((state) => state.tasks.filters);
  const reduxStatus = useAppSelector((state) => state.tasks.status);

  const [searchTerm, setSearchTerm] = useState(reduxFilters.search);
  const debouncedSearch = useDebounce(searchTerm, delay);

  // Guards against race conditions and stale debounced dispatches on reset
  const isResettingRef = useRef(false);
  const isSearchActiveRef = useRef(false);
  const isInitialMount = useRef(true);

  // Sync searchTerm when Redux search filter changes externally (e.g. global reset)
  useEffect(() => {
    if (reduxFilters.search === '' && searchTerm !== '') {
      isResettingRef.current = true;
      setSearchTerm('');
    } else if (reduxFilters.search !== searchTerm && !isSearchActiveRef.current) {
      setSearchTerm(reduxFilters.search);
    }
  }, [reduxFilters.search]);

  // Track if search term is currently waiting for debounce delay
  const isDebouncing =
    !isResettingRef.current &&
    searchTerm.trim() !== debouncedSearch.trim() &&
    searchTerm.trim() !== reduxFilters.search.trim();

  useEffect(() => {
    if (isDebouncing) {
      isSearchActiveRef.current = true;
      dispatch(setLoadingState('loading'));
    }
  }, [isDebouncing, dispatch]);

  useEffect(() => {
    if (reduxStatus !== 'loading') {
      isSearchActiveRef.current = false;
      isResettingRef.current = false;
    }
  }, [reduxStatus]);

  // When debounce delay elapses and debouncedSearch changes, call API
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // If reset was triggered, ignore stale debounced value
    if (isResettingRef.current) {
      if (debouncedSearch === '') {
        isResettingRef.current = false;
      }
      return;
    }

    // Only dispatch search if debounced value is genuinely different from current Redux filter
    if (debouncedSearch.trim() !== reduxFilters.search.trim()) {
      isSearchActiveRef.current = true;
      dispatch(setSearch(debouncedSearch));
      dispatch(fetchTasks());
    }
  }, [debouncedSearch]); // Depend ONLY on debouncedSearch to prevent loop on external reset!

  const resetSearch = () => {
    isResettingRef.current = true;
    isSearchActiveRef.current = false;
    setSearchTerm('');
    dispatch(setSearch(''));
  };

  const isSearchLoading = isDebouncing || (isSearchActiveRef.current && reduxStatus === 'loading');

  return {
    searchTerm,
    setSearchTerm,
    resetSearch,
    debouncedSearch,
    status: isSearchLoading ? 'loading' : reduxStatus,
    isLoading: isSearchLoading,
    isSearchLoading,
    isDebouncing,
  };
}
