export const LKPaymentMethodEndpoints = {
  base: '/api/LKPaymentMethod',
  create: '/api/LKPaymentMethod',
  update: '/api/LKPaymentMethod',
  getById: (id: string) => `/api/LKPaymentMethod/${id}`,
  delete: (id: string) => `/api/LKPaymentMethod/${id}`,
} as const;
