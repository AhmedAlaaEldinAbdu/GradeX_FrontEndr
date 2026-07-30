import { useContext } from 'react';
import { RoleAccessContext } from '@/shared/context/role-access-context';

export const useRoleAccess = () => {
  const context = useContext(RoleAccessContext);
  if (!context) {
    throw new Error('useRoleAccess must be used within RoleAccessProvider');
  }

  return context;
};
