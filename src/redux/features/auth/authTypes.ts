import type { UserRoleType } from '@gradex/constants';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRoleType;
  avatar?: string;
  permissions?: string[];
  isAuthenticated?: boolean;
  schoolBrancheId?: string | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean; // Track if initial session check is complete
  error: string | null;
  token: string | null;
}
