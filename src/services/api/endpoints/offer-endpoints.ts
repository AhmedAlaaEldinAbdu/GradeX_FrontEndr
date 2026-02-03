const Offer = '/Offer';

export const OfferEndpoints = {
  base: Offer,
  create: Offer,
  update: Offer,
  getById: (id: string) => `${Offer}/${id}`,
  delete: (id: string) => `${Offer}/${id}`,
};

export default OfferEndpoints;
