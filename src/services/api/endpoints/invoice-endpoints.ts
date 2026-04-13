const Invoice = '/Invoice';

export const InvoiceEndpoints = {
  base: Invoice,
  create: Invoice,
  getById: (id: string) => `${Invoice}/${id}`,
  getInvoiceNumbers: `${Invoice}/InvoiceNumbers`,
  delete: (invoiceId: string) => `${Invoice}/${invoiceId}`,
};

export default InvoiceEndpoints;
