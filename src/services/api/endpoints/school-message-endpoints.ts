const SchoolMessage = '/SchoolMessage';

export const SchoolMessageEndpoints = {
  base: SchoolMessage,
  create: SchoolMessage,
  getAll: `${SchoolMessage}/GetAll`,
  getByStudentId: `${SchoolMessage}/GetMessageByStudentId`,
  markAsViewed: (id: string) => `${SchoolMessage}/${id}/mark-as-viewed`,
};
