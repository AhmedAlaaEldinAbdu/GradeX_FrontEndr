/**
 * React Hooks for Schools API
 * Custom hooks for interacting with schools API using React Query patterns
 */

import { useState, useCallback, useEffect } from 'react';
import { schoolsApi } from '@/services/api/schools.api';
import type {
  School,
  SchoolDetail,
  SchoolStatisticsResponse,
  CreateSchoolRequest,
  UpdateSchoolRequest,
} from '@/services/api/types/school.types';

// ============================================================================
// Types
// ============================================================================

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseListState<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  loading: boolean;
  error: Error | null;
}

// ============================================================================
// Schools List Hook
// ============================================================================

export function useSchools(/* params?: PaginationParams & SchoolFilters */) {
  const [state, setState] = useState<UseListState<School>>({
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    loading: false,
    error: null,
  });

  const fetchSchools = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await schoolsApi.getSchools();
      setState({
        data: response.data,
        total: response.meta.total,
        page: response.meta.page,
        limit: response.meta.limit,
        totalPages: response.meta.totalPages,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
    }
  }, []);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  return {
    ...state,
    refetch: fetchSchools,
  };
}

// ============================================================================
// School Detail Hook
// ============================================================================

export function useSchool(id: string) {
  const [state, setState] = useState<UseApiState<SchoolDetail>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchSchool = useCallback(async () => {
    if (!id) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await schoolsApi.getSchoolById(id);
      setState({
        data: response.data,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
    }
  }, [id]);

  useEffect(() => {
    fetchSchool();
  }, [fetchSchool]);

  return {
    ...state,
    refetch: fetchSchool,
  };
}

// ============================================================================
// Create School Hook
// ============================================================================

export function useCreateSchool() {
  const [state, setState] = useState<UseApiState<SchoolDetail>>({
    data: null,
    loading: false,
    error: null,
  });

  const createSchool = useCallback(async (data: CreateSchoolRequest) => {
    setState({ data: null, loading: true, error: null });
    try {
      const response = await schoolsApi.createSchool(data);
      setState({
        data: response.data,
        loading: false,
        error: null,
      });
      return response.data;
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error as Error,
      });
      throw error;
    }
  }, []);

  return {
    ...state,
    createSchool,
  };
}

// ============================================================================
// Update School Hook
// ============================================================================

export function useUpdateSchool() {
  const [state, setState] = useState<UseApiState<SchoolDetail>>({
    data: null,
    loading: false,
    error: null,
  });

  const updateSchool = useCallback(async (id: string, data: UpdateSchoolRequest) => {
    setState({ data: null, loading: true, error: null });
    try {
      const response = await schoolsApi.updateSchool(id, data);
      setState({
        data: response.data,
        loading: false,
        error: null,
      });
      return response.data;
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error as Error,
      });
      throw error;
    }
  }, []);

  return {
    ...state,
    updateSchool,
  };
}

// ============================================================================
// Delete School Hook
// ============================================================================

export function useDeleteSchool() {
  const [state, setState] = useState<UseApiState<boolean>>({
    data: null,
    loading: false,
    error: null,
  });

  const deleteSchool = useCallback(async (id: string) => {
    setState({ data: null, loading: true, error: null });
    try {
      const response = await schoolsApi.deleteSchool(id);
      setState({
        data: response.success,
        loading: false,
        error: null,
      });
      return response.success;
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error as Error,
      });
      throw error;
    }
  }, []);

  return {
    ...state,
    deleteSchool,
  };
}

// ============================================================================
// Pending Schools Hook
// ============================================================================

export function usePendingSchools(/* params?: PaginationParams */) {
  const [state, setState] = useState<UseListState<School>>({
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    loading: false,
    error: null,
  });

  const fetchPendingSchools = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await schoolsApi.getPendingSchools();
      setState({
        data: response.data,
        total: response.meta.total,
        page: response.meta.page,
        limit: response.meta.limit,
        totalPages: response.meta.totalPages,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
    }
  }, []);

  useEffect(() => {
    fetchPendingSchools();
  }, [fetchPendingSchools]);

  return {
    ...state,
    refetch: fetchPendingSchools,
  };
}

// ============================================================================
// School Statistics Hook
// ============================================================================

export function useSchoolStatistics() {
  const [state, setState] = useState<UseApiState<SchoolStatisticsResponse>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchStatistics = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await schoolsApi.getSchoolStatistics();
      setState({
        data: response,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    ...state,
    refetch: fetchStatistics,
  };
}

// ============================================================================
// Approve School Hook
// ============================================================================

export function useApproveSchool() {
  const [state, setState] = useState<UseApiState<SchoolDetail>>({
    data: null,
    loading: false,
    error: null,
  });

  const approveSchool = useCallback(async (id: string, notes?: string) => {
    setState({ data: null, loading: true, error: null });
    try {
      const response = await schoolsApi.approveSchool(id, notes);
      setState({
        data: response.data,
        loading: false,
        error: null,
      });
      return response.data;
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error as Error,
      });
      throw error;
    }
  }, []);

  return {
    ...state,
    approveSchool,
  };
}

// ============================================================================
// Reject School Hook
// ============================================================================

export function useRejectSchool() {
  const [state, setState] = useState<UseApiState<SchoolDetail>>({
    data: null,
    loading: false,
    error: null,
  });

  const rejectSchool = useCallback(async (id: string, reason: string) => {
    setState({ data: null, loading: true, error: null });
    try {
      const response = await schoolsApi.rejectSchool(id, reason);
      setState({
        data: response.data,
        loading: false,
        error: null,
      });
      return response.data;
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error as Error,
      });
      throw error;
    }
  }, []);

  return {
    ...state,
    rejectSchool,
  };
}

// ============================================================================
// Bulk Operations Hook
// ============================================================================

export function useBulkSchoolOperations() {
  const [state, setState] = useState<UseApiState<{ success: boolean }>>({
    data: null,
    loading: false,
    error: null,
  });

  const bulkDelete = useCallback(async (ids: string[]) => {
    setState({ data: null, loading: true, error: null });
    try {
      const response = await schoolsApi.bulkDeleteSchools(ids);
      setState({
        data: { success: response.success },
        loading: false,
        error: null,
      });
      return response;
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error as Error,
      });
      throw error;
    }
  }, []);

  const bulkApprove = useCallback(async (ids: string[]) => {
    setState({ data: null, loading: true, error: null });
    try {
      const response = await schoolsApi.bulkApproveSchools(ids);
      setState({
        data: { success: response.success },
        loading: false,
        error: null,
      });
      return response;
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error as Error,
      });
      throw error;
    }
  }, []);

  const bulkReject = useCallback(async (ids: string[], reason: string) => {
    setState({ data: null, loading: true, error: null });
    try {
      const response = await schoolsApi.bulkRejectSchools(ids, reason);
      setState({
        data: { success: response.success },
        loading: false,
        error: null,
      });
      return response;
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error as Error,
      });
      throw error;
    }
  }, []);

  return {
    ...state,
    bulkDelete,
    bulkApprove,
    bulkReject,
  };
}

// ============================================================================
// Export All
// ============================================================================

export const schoolHooks = {
  useSchools,
  useSchool,
  useCreateSchool,
  useUpdateSchool,
  useDeleteSchool,
  usePendingSchools,
  useSchoolStatistics,
  useApproveSchool,
  useRejectSchool,
  useBulkSchoolOperations,
};
