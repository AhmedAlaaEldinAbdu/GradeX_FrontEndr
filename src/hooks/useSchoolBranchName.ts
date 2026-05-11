import { useEffect, useState } from 'react';
import { axiosClient } from '@/lib/http';
import { SchoolsEndpoints } from '@/services/api/endpoints/schools-endpoints';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';

/**
 * Shared fetcher for the current school branch's display name.
 *
 * The same endpoint was previously hit by both Header and Sidebar on every page
 * mount under MainLayout — this module-level Promise cache makes sure each
 * `branchId` is fetched at most once per session, no matter how many components
 * call the hook.
 */
const cache: Record<string, Promise<string>> = {};

const fetchSchoolBranchName = (branchId: string): Promise<string> => {
  if (!cache[branchId]) {
    cache[branchId] = axiosClient
      .get(SchoolsEndpoints.getSchoolBranchMobile(branchId))
      .then((res) => res?.data?.data?.nameBranch || '')
      .catch(() => {
        // Don't poison the cache on failure — let the next caller retry.
        delete cache[branchId];
        return '';
      });
  }
  return cache[branchId];
};

interface UseSchoolBranchNameResult {
  name: string;
  isLoading: boolean;
}

/**
 * Returns the current school branch's display name, fetched once and shared
 * across all consumers in the app. When there's no branch id (e.g. super-admin)
 * it returns an empty name and `isLoading: false`.
 */
export function useSchoolBranchName(): UseSchoolBranchNameResult {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const branchId = getCurrentSchoolBranchId();
    if (!branchId) return;

    let cancelled = false;
    setIsLoading(true);
    fetchSchoolBranchName(branchId)
      .then((value) => {
        if (!cancelled) setName(value);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { name, isLoading };
}
