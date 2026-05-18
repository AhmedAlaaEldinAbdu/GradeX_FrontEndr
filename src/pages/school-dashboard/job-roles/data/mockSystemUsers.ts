// Dummy system users data mirroring the design. Replace with API data on backend integration.

export interface MockSystemUser {
  id: string;
  userName: string;
  role: string;
}

export const MOCK_SYSTEM_USERS: MockSystemUser[] = Array.from({ length: 6 }, (_, i) => ({
  id: String(i + 1),
  userName: 'محمد محمد، محمد محمد، محمد محمد، محمد محمد، محمد محمد، محمد محمد، محمد محمد',
  role: 'مشرف عام',
}));

// Dummy selectable options for the Add/Edit user form. Replace with API data on integration.
export const MOCK_USER_NAME_OPTIONS = Array.from({ length: 6 }, (_, i) => ({
  value: String(i + 1),
  label: `أحمد محمد ${i + 1}`,
}));

export const MOCK_ROLE_OPTIONS = Array.from({ length: 6 }, (_, i) => ({
  value: String(i + 1),
  label: 'مشرف عام',
}));
