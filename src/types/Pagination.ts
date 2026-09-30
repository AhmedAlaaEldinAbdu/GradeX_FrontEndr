export interface Pagination {
  totalPages: number;
  totalItems: number;
  pageIndex: number;
  pageSize: number;
  setPageIndex?: (index: number) => void;
  setPageSize?: (size: number) => void;
}
