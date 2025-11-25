export interface FixedHoliday {
  id: string;
  date: string;
  dayName: string;
  reason: string;
  isEditable: boolean;
  dateRange: string;
  arabicDateRange?: string;
  hasOfficialDocument: boolean;
  filePath?: string;
}

export interface OfficialHoliday {
  id: string;
  dateRange: string;
  arabicDateRange?: string;
  reason: string;
  hasOfficialDocument: boolean;
  date?: string;
  filePath?: string;
}
