export interface FixedHoliday {
  id: number;
  date: string;
  dayName: string;
  reason: string;
  isEditable: boolean;
}

export interface OfficialHoliday {
  id: number;
  dateRange: string;
  arabicDateRange?: string;
  reason: string;
  hasOfficialDocument: boolean;
  date?: string;
}
