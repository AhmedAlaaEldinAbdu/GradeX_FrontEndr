/**
 * Books Redux Slice
 * State management for books
 */

import {
  createSlice,
  type PayloadAction,
  type ActionReducerMapBuilder,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { bookApiService } from '@/services/api/books/books.service';
import type {
  BookGrade,
  BookQueryParams,
  FlattenedBook,
  BookStatus,
  CreateBookRequest,
  UpdateBookRequest,
  Book,
} from '@/types/books';
import { getErrorMessage } from '@/lib/http';

// ============================================================================
// Types
// ============================================================================

export interface BookFilters {
  searchName?: string;
  materialId?: string;
  gradeId?: string;
  status?: BookStatus;
  schoolBranchesId?: string;
}

export interface BooksState {
  // Data
  bookGrades: BookGrade[];
  flattenedBooks: FlattenedBook[];
  currentBook:
    | (FlattenedBook & { packageType?: number; priceView?: number; number?: number })
    | null;

  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Filters
  filters: BookFilters;

  // Loading States
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Error States
  error: string | null;

  // UI States
  selectedBookIds: string[];
  isInitialized: boolean;
}

export interface FetchBooksPayload {
  page?: number;
  limit?: number;
  filters?: BookFilters;
}

export interface FetchBooksResponse {
  bookGrades: BookGrade[];
  flattenedBooks: FlattenedBook[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: BooksState = {
  // Data
  bookGrades: [],
  flattenedBooks: [],
  currentBook: null,

  // Pagination
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  // Filters
  filters: {},

  // Loading States
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,

  // Error States
  error: null,

  // UI States
  selectedBookIds: [],
  isInitialized: false,
};

// ============================================================================
// Async Thunks
// ============================================================================

export const fetchBooks = createAsyncThunk<FetchBooksResponse, FetchBooksPayload | void>(
  'books/fetchBooks',
  async (payload, { rejectWithValue }) => {
    try {
      const params: Partial<BookQueryParams> = {};

      if (payload) {
        if (payload.page) params.PageIndex = payload.page;
        if (payload.limit) params.PageSize = payload.limit;

        if (payload.filters) {
          if (payload.filters.searchName) params.SearchName = payload.filters.searchName;
          if (payload.filters.materialId) params.MaterialId = payload.filters.materialId;
          if (payload.filters.gradeId) params.GradeId = payload.filters.gradeId;
          if (payload.filters.status !== undefined) params.Status = payload.filters.status;
          if (payload.filters.schoolBranchesId)
            params.SchoolBranchesId = payload.filters.schoolBranchesId;
        }
      }

      const response = await bookApiService.getBooks(params as BookQueryParams);

      if (!response?.isSuccess || !response.data) {
        return {
          bookGrades: [],
          flattenedBooks: [],
          meta: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
          },
        };
      }

      const flattenedBooks = bookApiService.flattenBooksForDisplay(response);

      return {
        bookGrades: response.data.bookGradeDto || [],
        flattenedBooks,
        meta: {
          total: response.data.totalItems || 0,
          page: response.data.pageIndex || 1,
          limit: response.data.pageSize || 10,
          totalPages: response.data.totalPages || 0,
        },
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteBook = createAsyncThunk<string, string>(
  'books/deleteBook',
  async (id, { rejectWithValue }) => {
    try {
      await bookApiService.deleteBook(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const addBook = createAsyncThunk<Book, CreateBookRequest>(
  'books/addBook',
  async (data, { rejectWithValue }) => {
    try {
      const result = await bookApiService.createBook(data);

      if (!result.success) {
        return rejectWithValue(result.message);
      }

      return result.data as Book;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchBookById = createAsyncThunk<
  FlattenedBook & { packageType?: number; priceView?: number; number?: number },
  { bookId: string; gradeBookId: string }
>('books/fetchBookById', async ({ bookId, gradeBookId }, { rejectWithValue }) => {
  try {
    const result = await bookApiService.getBookById(bookId, gradeBookId);

    if (!result.success || !result.data) {
      return rejectWithValue(result.message);
    }

    return result.data as FlattenedBook & {
      packageType?: number;
      priceView?: number;
      number?: number;
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateBook = createAsyncThunk<Book, { id: string; data: UpdateBookRequest }>(
  'books/updateBook',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const result = await bookApiService.updateBook(id, data);

      if (!result.success) {
        return rejectWithValue(result.message);
      }

      return result.data as Book;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ============================================================================
// Slice Definition
// ============================================================================

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<BooksState['filters']>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    clearError: (state) => {
      state.error = null;
    },
    selectBook: (state, action: PayloadAction<string>) => {
      if (!state.selectedBookIds.includes(action.payload)) {
        state.selectedBookIds.push(action.payload);
      }
    },
    deselectBook: (state, action: PayloadAction<string>) => {
      state.selectedBookIds = state.selectedBookIds.filter((id) => id !== action.payload);
    },
    selectAllBooks: (state) => {
      state.selectedBookIds = state.flattenedBooks.map((book) => book.id);
    },
    clearSelection: (state) => {
      state.selectedBookIds = [];
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<BooksState>) => {
    // Fetch Books
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action: PayloadAction<FetchBooksResponse>) => {
        state.isLoading = false;
        state.bookGrades = action.payload.bookGrades;
        state.flattenedBooks = action.payload.flattenedBooks;
        state.pagination = {
          page: action.payload.meta.page,
          limit: action.payload.meta.limit,
          total: action.payload.meta.total,
          totalPages: action.payload.meta.totalPages,
        };
        state.isInitialized = true;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Book
    builder
      .addCase(deleteBook.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteBook.fulfilled, (state, action: PayloadAction<string>) => {
        state.isDeleting = false;
        state.flattenedBooks = state.flattenedBooks.filter((book) => book.id !== action.payload);
        state.selectedBookIds = state.selectedBookIds.filter((id) => id !== action.payload);
      })
      .addCase(deleteBook.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });

    // Add Book
    builder
      .addCase(addBook.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(addBook.fulfilled, (state) => {
        state.isCreating = false;
      })
      .addCase(addBook.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Fetch Book By ID
    builder
      .addCase(fetchBookById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.currentBook = null;
      })
      .addCase(fetchBookById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBook = action.payload;
      })
      .addCase(fetchBookById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Book
    builder
      .addCase(updateBook.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateBook.fulfilled, (state) => {
        state.isUpdating = false;
        state.currentBook = null;
      })
      .addCase(updateBook.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });
  },
});

// ============================================================================
// Export Actions and Reducer
// ============================================================================

export const {
  setFilters,
  clearFilters,
  clearError,
  selectBook,
  deselectBook,
  selectAllBooks,
  clearSelection,
} = booksSlice.actions;

export default booksSlice.reducer;
