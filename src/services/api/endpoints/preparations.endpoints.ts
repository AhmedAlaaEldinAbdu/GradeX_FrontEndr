export const PreparationEndpoints = {
  getPreparations: '/Preparation',
  addPreparation: '/Preparation',
  editPreparation: (id: string) => `/Preparation/${id}`,
  deletePreparation: (id: string) => `/Preparation/${id}`,
  getPreparationDetails: (id: string) => `/Preparation/${id}`,
};
