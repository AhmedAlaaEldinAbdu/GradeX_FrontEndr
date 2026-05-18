const DailyReport = '/DailyReport';

export const DailyReportEndpoints = {
  base: DailyReport,
  list: DailyReport,
  create: DailyReport,
  update: DailyReport,
  getById: (id: string) => `${DailyReport}/${id}`,
  delete: (id: string) => `${DailyReport}/${id}`,
  byParent: `${DailyReport}/by-parent`,
};

export default DailyReportEndpoints;
