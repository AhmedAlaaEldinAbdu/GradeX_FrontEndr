const AcademicCalendar = '/AcademicCalendar';

export const AcademicCalendarEndpoints = {
  addAcademicCalendar: AcademicCalendar,
  getAcademicCalendars: AcademicCalendar,
  editAcademicCalendar: AcademicCalendar,
  getAcademicCalendarById: (id: string) => `${AcademicCalendar}/${id}`,
  deleteAcademicCalendar: (id: string) => `${AcademicCalendar}/${id}`,
};

export default AcademicCalendarEndpoints;
