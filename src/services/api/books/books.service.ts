import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { BookEndpoints } from '../endpoints/book-endpoints';
import type {
  BookListResponse,
  BookQueryParams,
  FlattenedBook,
  CreateBookRequest,
  UpdateBookRequest,
  Book,
  BookDetailResponse,
  BookGradeDetailResponse,
} from '@/types/books';

/**
 * Get list of books with pagination and filters
 */
export async function getBooks(params?: BookQueryParams): Promise<BookListResponse> {
  const response: AxiosResponse<BookListResponse> = await axiosClient.get(BookEndpoints.getBooks, {
    params,
    paramsSerializer: {
      serialize: (params) => {
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
          if (value === undefined || value === null) return;

          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        });

        return searchParams.toString();
      },
    },
  });

  if (!response?.data?.data) {
    return {
      data: {
        bookGradeDto: [],
        availableBooks: 0,
        soldBooks: 0,
        totalBooks: 0,
        totalItems: 0,
        totalPages: 0,
        pageIndex: params?.PageIndex || 1,
        pageSize: params?.PageSize || 10,
      },
      isSuccess: false,
      message: '',
      validationErrors: null,
    };
  }

  return response.data;
}

/**
 * Flatten the nested book structure for table display
 */
export function flattenBooksForDisplay(response: BookListResponse): FlattenedBook[] {
  if (!response?.data?.bookGradeDto) return [];

  const flattened: FlattenedBook[] = [];

  response.data.bookGradeDto.forEach((grade) => {
    grade.bookDtos.forEach((book) => {
      flattened.push({
        id: book.id,
        gradeBookId: grade.gradeBookId,
        name: book.name,
        code: book.code,
        price: book.price,
        fileName: book.fileName,
        filePath: book.filePath,
        totalQuantity: book.totalQuantity,
        soldQuantity: book.soldQuantity,
        remainingQuantity: book.remainingQuantity,
        status: book.status,
        gradeId: grade.gradeId,
        gradeNameAr: grade.gradeNameAr,
        gradeNameEn: grade.gradeNameEn,
        materialId: grade.materialId,
        materialName: grade.materialName,
      });
    });
  });

  return flattened;
}

/**
 * Delete a book
 */
export async function deleteBook(id: string): Promise<{ success: boolean; message: string }> {
  const response: AxiosResponse<{
    data: string | null;
    isSuccess: boolean;
    message: string;
    validationErrors: string[] | null;
  }> = await axiosClient.delete(BookEndpoints.deleteBook(id));

  return {
    success: response.data.isSuccess,
    message: response.data.message || 'Book deleted successfully',
  };
}

/**
 * Create a new book
 */
export async function createBook(
  data: CreateBookRequest
): Promise<{ success: boolean; message: string; data?: Book }> {
  const formData = new FormData();
  formData.append('Name', data.name);
  formData.append('Code', data.code);
  formData.append('Price', String(data.price));
  formData.append('PriceView', String(data.priceView ?? 1));
  formData.append('TotalQuantity', String(data.totalQuantity));
  formData.append('PackageType', String(data.packageType));
  formData.append('Number', String(data.number ?? 0));
  formData.append('GradeId', data.gradeId);
  formData.append('MaterialId', data.materialId);
  formData.append('FileName', data.fileName ?? '');
  if (data.schoolBranchesId) {
    formData.append('SchoolBranchesId', data.schoolBranchesId);
  }
  if (data.file) {
    formData.append('FilePath', data.file);
  }

  const response: AxiosResponse<{
    data: Book | null;
    isSuccess: boolean;
    message: string;
    validationErrors: string[] | null;
  }> = await axiosClient.post(BookEndpoints.addBook, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return {
    success: response.data.isSuccess,
    message: response.data.message || 'Book created successfully',
    data: response.data.data || undefined,
  };
}

/**
 * Get a single book by ID
 */
export async function getBookById(
  bookId: string,
  gradeBookId: string
): Promise<{
  success: boolean;
  data?: FlattenedBook & { packageType: number; priceView: number; number: number };
  message: string;
}> {
  try {
    // Call both endpoints in parallel
    const [bookResponse, gradeResponse] = await Promise.all([
      axiosClient.get<BookDetailResponse>(BookEndpoints.getBookDetails(bookId)),
      axiosClient.get<BookGradeDetailResponse>(BookEndpoints.getBookGradeDetails(gradeBookId)),
    ]);

    if (!bookResponse.data.isSuccess || !bookResponse.data.data) {
      return {
        success: false,
        message: bookResponse.data.message || 'Book not found',
      };
    }

    if (!gradeResponse.data.isSuccess || !gradeResponse.data.data) {
      return {
        success: false,
        message: gradeResponse.data.message || 'Book grade info not found',
      };
    }

    const book = bookResponse.data.data;
    const grade = gradeResponse.data.data;

    return {
      success: true,
      data: {
        id: book.id,
        gradeBookId: grade.gradeBookId,
        name: book.name,
        code: book.code,
        price: book.price,
        fileName: book.fileName,
        filePath: book.filePath,
        totalQuantity: book.totalQuantity,
        soldQuantity: book.soldQuantity,
        remainingQuantity: book.remainingQuantity,
        status: book.status,
        gradeId: grade.gradeId,
        gradeNameAr: grade.gradeNameAr,
        gradeNameEn: grade.gradeNameEn,
        materialId: grade.materialId,
        materialName: grade.materialName,
        packageType: grade.packageType,
        priceView: grade.priceView,
        number: grade.number,
      },
      message: 'Book fetched successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to fetch book details',
    };
  }
}

/**
 * Update a book
 */
export async function updateBook(
  id: string,
  data: UpdateBookRequest
): Promise<{ success: boolean; message: string; data?: Book }> {
  const formData = new FormData();
  formData.append('Name', data.name);
  formData.append('Code', data.code);
  formData.append('Price', String(data.price));
  formData.append('PriceView', String(data.priceView ?? 1));
  formData.append('TotalQuantity', String(data.totalQuantity));
  formData.append('PackageType', String(data.packageType));
  formData.append('Number', String(data.number ?? 0));
  formData.append('GradeId', data.gradeId);
  formData.append('MaterialId', data.materialId);
  formData.append('FileName', data.fileName ?? '');
  if (data.schoolBranchesId) {
    formData.append('SchoolBranchesId', data.schoolBranchesId);
  }

  if (data.file) {
    formData.append('FilePath', data.file);
  }

  const response: AxiosResponse<{
    data: Book | null;
    isSuccess: boolean;
    message: string;
    validationErrors: string[] | null;
  }> = await axiosClient.put(BookEndpoints.editBook(id), formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return {
    success: response.data.isSuccess,
    message: response.data.message || 'Book updated successfully',
    data: response.data.data || undefined,
  };
}

// ============================================================================
// Export All Services
// ============================================================================

export const bookApiService = {
  getBooks,
  flattenBooksForDisplay,
  deleteBook,
  createBook,
  getBookById,
  updateBook,
};

export default bookApiService;
