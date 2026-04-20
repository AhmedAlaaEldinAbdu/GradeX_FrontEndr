const Invoice = '/Invoice';

export const InvoiceEndpoints = {
  base: Invoice,
  create: Invoice,
  getById: (id: string, language?: string) =>
    `${Invoice}/${id}${language ? `?language=${language}` : ''}`,
  getInvoiceNumbers: `${Invoice}/InvoiceNumbers`,
  getItems: (studentId: string) => `${Invoice}/Items?StudentId=${studentId}`,
  delete: (invoiceId: string) => `${Invoice}/${invoiceId}`,
};

export default InvoiceEndpoints;
