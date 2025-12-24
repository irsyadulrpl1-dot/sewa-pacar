import { useState, useCallback, useEffect, useRef } from "react";

export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isSuccess: boolean;
  isError: boolean;
}

export interface UseAsyncOptions {
  immediate?: boolean;
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

/**
 * A robust hook for handling async operations with proper loading, error, and success states.
 * Prevents memory leaks by tracking component mount state.
 */
export function useAsync<T>(
  asyncFn: () => Promise<T>,
  options: UseAsyncOptions = {}
) {
  const { immediate = false, onSuccess, onError } = options;
  
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: immediate,
    error: null,
    isSuccess: false,
    isError: false,
  });

  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async () => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      isError: false,
    }));

    try {
      const result = await asyncFn();
      
      if (isMountedRef.current) {
        setState({
          data: result,
          isLoading: false,
          error: null,
          isSuccess: true,
          isError: false,
        });
        onSuccess?.(result);
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      
      if (isMountedRef.current && error.name !== 'AbortError') {
        setState({
          data: null,
          isLoading: false,
          error,
          isSuccess: false,
          isError: true,
        });
        onError?.(error);
      }
      
      throw error;
    }
  }, [asyncFn, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
      isSuccess: false,
      isError: false,
    });
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (immediate) {
      execute().catch(() => {
        // Error is already handled in state
      });
    }

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [immediate, execute]);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Hook for debounced values - useful for search inputs
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for safe state updates that checks if component is mounted
 */
export function useSafeState<T>(initialState: T) {
  const isMountedRef = useRef(true);
  const [state, setState] = useState<T>(initialState);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const setSafeState = useCallback((value: T | ((prev: T) => T)) => {
    if (isMountedRef.current) {
      setState(value);
    }
  }, []);

  return [state, setSafeState] as const;
}

/**
 * Hook for retry logic on failed operations
 */
export function useRetry<T>(
  asyncFn: () => Promise<T>,
  maxRetries: number = 3,
  retryDelay: number = 1000
) {
  const [retryCount, setRetryCount] = useState(0);
  const { data, isLoading, error, execute, reset } = useAsync(asyncFn);

  const executeWithRetry = useCallback(async () => {
    try {
      return await execute();
    } catch (err) {
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        setRetryCount(prev => prev + 1);
        return executeWithRetry();
      }
      throw err;
    }
  }, [execute, retryCount, maxRetries, retryDelay]);

  const resetWithRetry = useCallback(() => {
    setRetryCount(0);
    reset();
  }, [reset]);

  return {
    data,
    isLoading,
    error,
    retryCount,
    execute: executeWithRetry,
    reset: resetWithRetry,
  };
}
