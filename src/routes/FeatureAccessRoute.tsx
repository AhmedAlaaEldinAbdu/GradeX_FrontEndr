import { useEffect, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { getSchoolFeatureListPath } from '@/constants/role-access';
import { useRoleAccess } from '@/hooks/useRoleAccess';

interface FeatureAccessRouteProps {
  children: ReactNode;
}

export default function FeatureAccessRoute({ children }: FeatureAccessRouteProps) {
  const { canEdit, currentFeatureKey, denyAction } = useRoleAccess();

  useEffect(() => {
    if (!canEdit) denyAction();
  }, [canEdit, denyAction]);

  if (!canEdit) {
    return <Navigate to={getSchoolFeatureListPath(currentFeatureKey)} replace />;
  }

  return <>{children}</>;
}
