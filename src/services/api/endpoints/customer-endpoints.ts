const Customer = '/Customer';

export const CustomerEndpoints = {
  base: Customer,
  create: Customer,
  update: (id: string) => `${Customer}?Id=${encodeURIComponent(id)}`,
  getById: (id: string) => `${Customer}/${id}`,
  delete: (id: string) => `${Customer}/${id}`,
};

export default CustomerEndpoints;
