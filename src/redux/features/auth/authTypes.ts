import type { UserRoleType } from '@gradex/constants';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRoleType;
  avatar?: string;
  permissions?: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
}
