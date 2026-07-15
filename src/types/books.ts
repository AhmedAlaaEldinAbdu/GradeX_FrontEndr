export const BookStatus = {
  Active: 1,
  Inactive: 2,
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
  coverImage?: string | null;
  totalQuantity: number;
  soldQuantity: number;
  remainingQuantity: number;
  status: BookStatus;
}

export interface BookGrade {
  gradeBookId: string;
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

export interface BookDetailResponse {
  data: Book | null;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

export interface BookGradeDetailResponse {
  data: BookGrade | null;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface BookListData {
  bookGradeDto: BookGrade[];
  availableBooks: number;
  soldBooks: number;
  totalBooks: number;
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
  SchoolBranchesId?: string;
}

// ============================================================================
// Flattened Book for Table Display
// ============================================================================

export interface FlattenedBook {
  id: string;
  gradeBookId: string;
  name: string;
  code: string;
  price: number;
  fileName: string;
  filePath: string;
  coverImage?: string | null;
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

// ============================================================================
// Create/Update Book Request Types
// ============================================================================

export interface CreateBookRequest {
  name: string;
  nameEn?: string;
  code: string;
  price: number;
  priceView?: number;
  totalQuantity: number;
  packageType: number;
  number?: number;
  gradeId: string;
  materialId: string;
  fileName?: string;
  filePath?: string;
  file?: File;
  coverImage?: File;
  schoolBranchesId?: string;
}

export interface UpdateBookRequest extends CreateBookRequest {
  id: string;
}
