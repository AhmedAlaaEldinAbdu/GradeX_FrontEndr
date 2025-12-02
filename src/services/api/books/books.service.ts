import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { BookEndpoints } from '../endpoints/book-endpoints';
import type { BookListResponse, BookQueryParams, FlattenedBook } from '@/types/books';

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

// ============================================================================
// Export All Services
// ============================================================================

export const bookApiService = {
  getBooks,
  flattenBooksForDisplay,
  deleteBook,
};

export default bookApiService;
