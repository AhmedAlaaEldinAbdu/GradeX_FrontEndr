const MonthlyCalendar = '/MonthlyCalendar';

export const MonthlyCalendarEndpoints = {
  addMonthlyEvent: MonthlyCalendar,
  getMonthlyEvents: MonthlyCalendar,
  editMonthlyEvent: MonthlyCalendar,
  getMonthlyEventById: (id: string) => `${MonthlyCalendar}/${id}`,
  deleteMonthlyEvent: (id: string) => `${MonthlyCalendar}/${id}`,
};

export default MonthlyCalendarEndpoints;
