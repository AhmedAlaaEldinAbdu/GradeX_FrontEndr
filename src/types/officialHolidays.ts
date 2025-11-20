export interface FixedHoliday {
  id: string;
  date: string;
  dayName: string;
  reason: string;
  isEditable: boolean;
}

export interface OfficialHoliday {
  id: string;
  dateRange: string;
  arabicDateRange?: string;
  reason: string;
  hasOfficialDocument: boolean;
  date?: string;
}
