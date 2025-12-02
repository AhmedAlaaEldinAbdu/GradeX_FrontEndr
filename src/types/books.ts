export const BookStatus = {
  Active: 1,
  Inactive: 0,
} as const;

export type BookStatus = (typeof BookStatus)[keyof typeof BookStatus];

// ============================================================================
// Book Entity Types
// ============================================================================

export interface Book {
  id: string;
  name: string;
  code: string;
  price: number;
  fileName: string;
  filePath: string;
  totalQuantity: number;
  soldQuantity: number;
  remainingQuantity: number;
  status: BookStatus;
}

export interface BookGrade {
  gradeId: string;
  gradeNameAr: string;
  gradeNameEn: string;
  materialId: string;
  materialName: string;
  number: number;
  packageType: number;
  priceView: number;
  createdOn: string;
  bookDtos: Book[];
}

// ============================================================================
// API Response Types
// ============================================================================

export interface BookListData {
  bookGradeDto: BookGrade[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface BookListResponse {
  data: BookListData;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

// ============================================================================
// Query Parameters
// ============================================================================

export interface BookQueryParams {
  PageIndex?: number;
  PageSize?: number;
  SearchName?: string;
  MaterialId?: string;
  GradeId?: string;
  Status?: BookStatus;
}

// ============================================================================
// Flattened Book for Table Display
// ============================================================================

export interface FlattenedBook {
  id: string;
  name: string;
  code: string;
  price: number;
  fileName: string;
  filePath: string;
  totalQuantity: number;
  soldQuantity: number;
  remainingQuantity: number;
  status: BookStatus;
  gradeId: string;
  gradeNameAr: string;
  gradeNameEn: string;
  materialId: string;
  materialName: string;
}
