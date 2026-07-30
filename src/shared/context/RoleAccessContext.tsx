import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import {
  canPerformSchoolAction,
  resolveSchoolAccess,
  resolveSchoolFeatureFromLocation,
  SchoolAccessLevel,
  type SchoolActionContext,
  type SchoolPermissionSnapshot,
} from '@/constants/role-access';
import { useAppSelector } from '@/hooks/useRedux';
import { fetchSchoolPermissionSnapshot } from '@/services/api/role-access/role-access.service';
import NoAccessPermissionModal from '@/shared/popups/NoAccessPermissionModal';
import { RoleAccessContext } from '@/shared/context/role-access-context';

export function RoleAccessProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  const [isDeniedModalOpen, setIsDeniedModalOpen] = useState(false);
  const [permissionSnapshot, setPermissionSnapshot] = useState<SchoolPermissionSnapshot | null>(
    null
  );

  useEffect(() => {
    let isActive = true;
    setPermissionSnapshot(null);

    void fetchSchoolPermissionSnapshot(user).then((snapshot) => {
      if (isActive) setPermissionSnapshot(snapshot);
    });

    return () => {
      isActive = false;
    };
  }, [user]);

  const currentFeatureKey = useMemo(
    () => resolveSchoolFeatureFromLocation(location.pathname, location.search),
    [location.pathname, location.search]
  );
  const access = useMemo(
    () => resolveSchoolAccess(currentFeatureKey, user, permissionSnapshot),
    [currentFeatureKey, permissionSnapshot, user]
  );
  const canEdit = access === SchoolAccessLevel.EDIT;

  const denyAction = useCallback(() => {
    setIsDeniedModalOpen(true);
  }, []);

  const canPerformAction = useCallback(
    (action: SchoolActionContext): boolean =>
      canPerformSchoolAction({
        featureKey: currentFeatureKey,
        access,
        action,
        permissionSnapshot,
      }),
    [access, currentFeatureKey, permissionSnapshot]
  );

  const guardAction = useCallback(
    (actionContext: SchoolActionContext, action: () => void): boolean => {
      if (!canPerformAction(actionContext)) {
        denyAction();
        return false;
      }

      action();
      return true;
    },
    [canPerformAction, denyAction]
  );

  const guardMutation = useCallback(
    (action: () => void): boolean => {
      if (!canEdit) {
        denyAction();
        return false;
      }

      action();
      return true;
    },
    [canEdit, denyAction]
  );

  const value = useMemo(
    () => ({
      currentFeatureKey,
      access,
      canView: true as const,
      canEdit,
      canPerformAction,
      guardAction,
      guardMutation,
      denyAction,
    }),
    [access, canEdit, canPerformAction, currentFeatureKey, denyAction, guardAction, guardMutation]
  );

  return (
    <RoleAccessContext.Provider value={value}>
      {children}
      <NoAccessPermissionModal
        isOpen={isDeniedModalOpen}
        onClose={() => setIsDeniedModalOpen(false)}
      />
    </RoleAccessContext.Provider>
  );
}
