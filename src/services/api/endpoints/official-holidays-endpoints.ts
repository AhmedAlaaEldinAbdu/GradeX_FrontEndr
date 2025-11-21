const LEAVE = '/Leave';

export const OfficialHolidaysEndpoints = {
  getOfficialHolidays: LEAVE,
  createHoliday: LEAVE,
  updateHoliday: (id: string) => `${LEAVE}/${id}`,
  deleteHoliday: (id: string) => `${LEAVE}/${id}`,
};
