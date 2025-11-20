const LEAVE = '/Leave';

export const OfficialHolidaysEndpoints = {
  getOfficialHolidays: LEAVE,
  deleteHoliday: (id: string) => `${LEAVE}/${id}`,
};
