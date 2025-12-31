import { type ReactNode } from 'react';
import Table from './Table';
import Pagination from './Pagination';
import Loading from './Loading';
import SearchInput from './SearchInput';
import NotFoundMessage from './NotFoundMessage';

export interface FilterConfig {
  type: 'search' | 'select' | 'custom';
  name: string;
  placeholder?: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  options?: Array<{ value: string; label: string }>;
  disabled?: boolean;
  loading?: boolean;
  customComponent?: ReactNode;
  width?: 'full' | '60%' | '50%' | '40%' | '30%' | '20%' | "15%" | 'auto';
}

export interface DataTableColumn<T> {
  header: string;
  headerComponent?: ReactNode;
  accessor: (row: T, index?: number) => ReactNode;
  headerClassName?: string;
  className?: string;
  sticky?: boolean;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DataTableProps<T> {
  // Data
  data: T[];
  columns: DataTableColumn<T>[];
  keyExtractor: (row: T) => string;

  // Pagination
  pagination?: PaginationData;
  onPageChange?: (page: number) => void;

  // Filters
  // Either an array of filter configs (rendered by DataTable)
  // OR a custom filter React node provided by the parent via `filterComponent`.
  filters?: FilterConfig[];
  // Optional: parent can provide a full custom filter ReactNode instead of configs.
  filterComponent?: ReactNode;
  showFilters?: boolean;
  onResetFilters?: () => void;

  // Bulk Actions
  bulkActions?: ReactNode;

  // Loading & Empty States
  isLoading?: boolean;
  emptyMessage?: string;

  // Translation
  t: (key: string) => string;
}

export default function DataTable<T>({
  data,
  columns,
  keyExtractor,
  pagination,
  onPageChange,
  filters = [],
  filterComponent,
  showFilters = true,
  onResetFilters,
  bulkActions,
  isLoading = false,
  emptyMessage,
  t,
}: DataTableProps<T>) {
  const renderFilter = (filter: FilterConfig, index: number) => {
    switch (filter.type) {
      case 'search':
        return (
          <SearchInput
            key={`filter-${index}`}
            value={filter.value as string}
            onChange={filter.onChange as (value: string) => void}
            placeholder={filter.placeholder || ''}
            name={filter.name}
          />
        );

      case 'select':
        return (
          <select
            key={`filter-${index}`}
            value={filter.value as string}
            onChange={(e) => (filter.onChange as (value: string) => void)(e.target.value)}
            className="h-[40px] w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={filter.disabled || filter.loading}
          >
            <option value="">
              {filter.loading ? t('common.loading') : filter.placeholder || ''}
            </option>
            {filter.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'custom':
        return <div key={`filter-${index}`}>{filter.customComponent}</div>;

      default:
        return null;
    }
  };

  const getFilterWidth = (filter: FilterConfig) => {
    switch (filter.width) {
      case 'full':
        return 'w-full';
      case '60%':
        return 'w-full xl:w-[60%]';
      case '50%':
        return 'w-full xl:w-[50%]';
      case '40%':
        return 'w-full xl:w-[40%]';
      case '30%':
        return 'w-full xl:w-[30%]';
      case '20%':
        return 'w-full xl:w-[20%]';
      case '15%':
        return 'w-full xl:w-[15%]';
      case 'auto':
        return 'w-auto min-w-[200px]';
      default:
        return 'flex-1 min-w-[200px]';
    }
  };

  // Separate search filters from other filters (when using FilterConfig[])
  const searchFilters = Array.isArray(filters) ? filters.filter((f) => f.type === 'search') : [];
  const otherFilters = Array.isArray(filters) ? filters.filter((f) => f.type !== 'search') : [];

  return (
    <div>
      {/* Filters Section */}
      {showFilters && ((Array.isArray(filters) && filters.length) || !!filterComponent) && (
        <div className="flex justify-between gap-3">
          <div className="mb-6 flex flex-1 flex-wrap gap-4 lg:flex-nowrap">
            {/* If parent supplied a custom filter component, render it as-is */}
            {filterComponent ? (
              <div className="w-[100%]">{filterComponent}</div>
            ) : (
              // Otherwise render built-in filter configs
              <>
                {/* Search Filters */}
                {searchFilters.length > 0 && (
                  <div
                    className={`grid grid-cols-1 gap-4 rounded-lg ${
                      searchFilters.length === 1
                        ? getFilterWidth(searchFilters[0])
                        : 'w-[100%] xl:w-[60%]'
                    }`}
                  >
                    {searchFilters.map((filter, index) => (
                      <div key={`search-${index}`} className="relative">
                        {renderFilter(filter, index)}
                      </div>
                    ))}
                  </div>
                )}

                {/* Other Filters (Select, Custom) */}
                {otherFilters.length > 0 && (
                  <div className="flex w-[100%] flex-wrap gap-4 rounded-lg">
                    {otherFilters.map((filter, index) => (
                      <div key={`other-${index}`} className={getFilterWidth(filter)}>
                        {renderFilter(filter, searchFilters.length + index)}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Reset Button */}
          {onResetFilters && (
            <button
              onClick={onResetFilters}
              className="flex h-[40px] w-[40px] items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
              title={t('actions.clearFilter')}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M21 12a9 9 0 1 0-3.46 6.54"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 3v6h-6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Bulk Actions */}
      {bulkActions && <div className="mb-4">{bulkActions}</div>}

      {/* Loading State - Only shows on table area */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loading />
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto">
            {!Array.isArray(data) || data.length === 0 ? (
              <NotFoundMessage message={emptyMessage} />
            ) : (
              <Table columns={columns} data={data} keyExtractor={keyExtractor} />
            )}
          </div>

          {/* Pagination */}
          {Array.isArray(data) &&
            data.length > 0 &&
            pagination &&
            pagination.totalPages > 0 &&
            onPageChange && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                to={Math.min(pagination.page * pagination.limit, pagination.total)}
                from={pagination.total}
                onPageChange={onPageChange}
              />
            )}
        </>
      )}
    </div>
  );
}
