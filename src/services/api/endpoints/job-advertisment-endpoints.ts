const JobAdvertisment = '/JobAdvertisment';

export const JobAdvertismentEndpoints = {
  addJobAdvertisment: JobAdvertisment,
  getJobAdvertisments: JobAdvertisment,
  editJobAdvertisment: JobAdvertisment,
  getJobAdvertismentById: (id: string) => `${JobAdvertisment}/${id}`,
  deleteJobAdvertisment: (id: string) => `${JobAdvertisment}/${id}`,
};

export default JobAdvertismentEndpoints;
