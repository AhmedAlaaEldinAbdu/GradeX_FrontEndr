const LEAVE = '/Leave';
const LK_COUNTRIES = '/LKCountries';

export const OfficialHolidaysEndpoints = {
  getOfficialHolidays: LEAVE,
  createHoliday: LEAVE,
  updateHoliday: (id: string) => `${LEAVE}/${id}`,
  deleteHoliday: (id: string) => `${LEAVE}/${id}`,
  getCountriesWithLeave: `${LK_COUNTRIES}/GetAllCountriesWithLeave`,
};
