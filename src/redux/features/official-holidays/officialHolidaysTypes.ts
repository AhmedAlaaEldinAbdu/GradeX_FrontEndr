import type {
  OfficialHoliday,
  OfficialHolidaysFilters,
} from '@/services/api/types/official-holidays.types';

export interface OfficialHolidaysState {
  // Data
  holidays: OfficialHoliday[];

  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Filters
  filters: OfficialHolidaysFilters;

  // Loading States
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Error States
  error: string | null;

  // UI States
  isInitialized: boolean;
}

export interface FetchOfficialHolidaysPayload {
  page?: number;
  limit?: number;
  filters?: OfficialHolidaysFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FetchOfficialHolidaysResponse {
  data: OfficialHoliday[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
