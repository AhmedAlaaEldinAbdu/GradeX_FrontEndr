// Dummy roles data mirroring the design. Replace with API data on backend integration.

export interface MockRole {
  id: string;
  name: string;
  description: string;
}

export const MOCK_ROLES: MockRole[] = Array.from({ length: 6 }, (_, i) => ({
  id: String(i + 1),
  name: 'مشرف عام',
  description: 'الوصف',
}));
