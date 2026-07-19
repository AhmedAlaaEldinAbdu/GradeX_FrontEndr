const RequestAppointment = '/RequestAppointment';

export const RequestAppointmentEndpoints = {
  base: RequestAppointment,
  getAll: RequestAppointment,
  markAsViewed: (id: string) => `${RequestAppointment}/${id}/mark-as-viewed`,
};

export default RequestAppointmentEndpoints;
