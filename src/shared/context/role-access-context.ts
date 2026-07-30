import { createContext } from 'react';
import type {
  SchoolAccessLevelType,
  SchoolActionContext,
  SchoolFeatureKey,
} from '@/constants/role-access';

export interface RoleAccessContextValue {
  currentFeatureKey: SchoolFeatureKey | null;
  access: SchoolAccessLevelType;
  canView: true;
  canEdit: boolean;
  canPerformAction: (action: SchoolActionContext) => boolean;
  guardAction: (actionContext: SchoolActionContext, action: () => void) => boolean;
  guardMutation: (action: () => void) => boolean;
  denyAction: () => void;
}

export const RoleAccessContext = createContext<RoleAccessContextValue | null>(null);
