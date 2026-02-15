const Offer = '/Offer';

export const OfferEndpoints = {
  base: Offer,
  create: Offer,
  update: (id: string) => `${Offer}?Id=${encodeURIComponent(id)}`,
  getById: (id: string) => `${Offer}/${id}`,
  delete: (id: string) => `${Offer}/${id}`,
};

export default OfferEndpoints;
