export const PreparationEndpoints = {
  getPreparations: '/Preparation',
  getPreparationById: (id: string) => `/Preparation/${id}`,
  addPreparation: '/Preparation',
  updatePreparation: '/Preparation',
  editPreparation: (id: string) => `/Preparation/${id}`,
  deletePreparation: (id: string) => `/Preparation/${id}`,
  getPreparationDetails: (id: string) => `/Preparation/${id}`,
};
