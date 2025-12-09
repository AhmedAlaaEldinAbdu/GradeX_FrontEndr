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
  id: string
): Promise<{ success: boolean; data?: FlattenedBook; message: string }> {
  const response: AxiosResponse<{
    data: {
      bookGradeDto: Array<{
        gradeId: string;
        gradeNameAr: string;
        gradeNameEn: string;
        materialId: string;
        materialName: string;
        number: number;
        packageType: number;
        priceView: number;
        bookDtos: Book[];
      }>;
    } | null;
    isSuccess: boolean;
    message: string;
    validationErrors: string[] | null;
  }> = await axiosClient.get(BookEndpoints.getBookById(id));

  if (!response.data.isSuccess || !response.data.data?.bookGradeDto?.[0]) {
    return {
      success: false,
      message: response.data.message || 'Book not found',
    };
  }

  const grade = response.data.data.bookGradeDto[0];
  const book = grade.bookDtos[0];

  return {
    success: true,
    data: {
      id: book.id,
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
    } as FlattenedBook & { packageType: number; priceView: number; number: number },
    message: 'Book fetched successfully',
  };
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
  formData.append('FilePath', data.filePath ?? '');
  if (data.file) {
    formData.append('File', data.file);
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
