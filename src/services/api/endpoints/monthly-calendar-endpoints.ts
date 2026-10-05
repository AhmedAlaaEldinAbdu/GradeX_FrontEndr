const MonthlyCalendar = '/MonthlyCalendar';

export const MonthlyCalendarEndpoints = {
  addMonthlyEvent: MonthlyCalendar,
  getMonthlyEvents: MonthlyCalendar,
  getMonthlyDashboardEvents: `${MonthlyCalendar}/GetAllDashboard`,
  editMonthlyEvent: MonthlyCalendar,
  getMonthlyEventById: (id: string) => `${MonthlyCalendar}/${id}`,
  deleteMonthlyEvent: (id: string) => `${MonthlyCalendar}/${id}`,
};

export default MonthlyCalendarEndpoints;
