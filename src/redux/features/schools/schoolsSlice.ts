/**
 * Schools Redux Slice
 * State management for schools
 */

import { createSlice, type PayloadAction, type ActionReducerMapBuilder } from '@reduxjs/toolkit';
import type { SchoolsState } from './schoolsTypes';
import type { SchoolFilters } from '@/services/api/types/school.types';
import {
  fetchSchools,
  fetchSchoolById,
  createSchool,
  updateSchool,
  deleteSchool,
  restoreSchool,
  updateSchoolStatus,
  approveSchool,
  rejectSchool,
  activateSchool,
  deactivateSchool,
  bulkOperation,
  bulkDeleteSchools,
  bulkApproveSchools,
  bulkRejectSchools,
  fetchSchoolStatistics,
  uploadSchoolLogo,
  uploadSchoolDocument,
  bulkImportSchools,
  exportSchools,
} from './schoolsActions';

// ============================================================================
// Initial State
// ============================================================================

const initialState: SchoolsState = {
  // Data
  schools: [],
  currentSchool: null,
  statistics: null,

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
  isFetchingStats: false,

  // Error States
  error: null,
  validationErrors: null,

  // UI States
  selectedSchoolIds: [],
  isInitialized: false,
};

// ============================================================================
// Slice Definition
// ============================================================================

const schoolsSlice = createSlice({
  name: 'schools',
  initialState,
  reducers: {
    /**
     * Set filters
     */
    setFilters: (state, action: PayloadAction<SchoolFilters>) => {
      state.filters = action.payload;
    },

    /**
     * Clear filters
     */
    clearFilters: (state) => {
      state.filters = {};
    },

    /**
     * Set pagination
     */
    setPagination: (state, action: PayloadAction<{ page?: number; limit?: number }>) => {
      if (action.payload.page !== undefined) {
        state.pagination.page = action.payload.page;
      }
      if (action.payload.limit !== undefined) {
        state.pagination.limit = action.payload.limit;
      }
    },

    /**
     * Select schools
     */
    selectSchools: (state, action: PayloadAction<string[]>) => {
      state.selectedSchoolIds = action.payload;
    },

    /**
     * Toggle school selection
     */
    toggleSchoolSelection: (state, action: PayloadAction<string>) => {
      const index = state.selectedSchoolIds.indexOf(action.payload);
      if (index > -1) {
        state.selectedSchoolIds.splice(index, 1);
      } else {
        state.selectedSchoolIds.push(action.payload);
      }
    },

    /**
     * Select all schools
     */
    selectAllSchools: (state) => {
      state.selectedSchoolIds = state.schools.map((school) => school.id);
    },

    /**
     * Clear selection
     */
    clearSelection: (state) => {
      state.selectedSchoolIds = [];
    },

    /**
     * Clear current school
     */
    clearCurrentSchool: (state) => {
      state.currentSchool = null;
    },

    /**
     * Clear errors
     */
    clearErrors: (state) => {
      state.error = null;
      state.validationErrors = null;
    },

    /**
     * Reset state
     */
    resetSchoolsState: () => initialState,
  },

  extraReducers: (builder: ActionReducerMapBuilder<SchoolsState>) => {
    // ========================================================================
    // Fetch Schools
    // ========================================================================

    builder
      .addCase(fetchSchools.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSchools.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.schools = action.payload.data;
        state.pagination = {
          page: action.payload.meta.page,
          limit: action.payload.meta.limit,
          total: action.payload.meta.total,
          totalPages: action.payload.meta.totalPages,
        };
        state.error = null;
      })
      .addCase(fetchSchools.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ========================================================================
    // Fetch School By ID
    // ========================================================================

    builder
      .addCase(fetchSchoolById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSchoolById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSchool = action.payload;
        state.error = null;
      })
      .addCase(fetchSchoolById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ========================================================================
    // Create School
    // ========================================================================

    builder
      .addCase(createSchool.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(createSchool.fulfilled, (state, action) => {
        state.isCreating = false;
        state.schools.unshift(action.payload);
        state.pagination.total += 1;
        state.error = null;
      })
      .addCase(createSchool.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // ========================================================================
    // Update School
    // ========================================================================

    builder
      .addCase(updateSchool.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(updateSchool.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.schools.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.schools[index] = action.payload;
        }
        if (state.currentSchool?.id === action.payload.id) {
          state.currentSchool = action.payload;
        }
        state.error = null;
      })
      .addCase(updateSchool.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // ========================================================================
    // Delete School
    // ========================================================================

    builder
      .addCase(deleteSchool.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteSchool.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.schools = state.schools.filter((s) => s.id !== action.payload);
        state.pagination.total -= 1;
        state.error = null;
      })
      .addCase(deleteSchool.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });

    // ========================================================================
    // Restore School
    // ========================================================================

    builder
      .addCase(restoreSchool.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(restoreSchool.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.schools = state.schools.filter((s) => s.id !== action.payload);
        state.error = null;
      })
      .addCase(restoreSchool.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // ========================================================================
    // Update School Status
    // ========================================================================

    builder
      .addCase(updateSchoolStatus.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateSchoolStatus.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.schools.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.schools[index] = action.payload;
        }
        if (state.currentSchool?.id === action.payload.id) {
          state.currentSchool = action.payload;
        }
        state.error = null;
      })
      .addCase(updateSchoolStatus.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // ========================================================================
    // Approve/Reject/Activate/Deactivate School
    // ========================================================================

    // Approve School
    builder
      .addCase(approveSchool.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(approveSchool.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.schools.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.schools[index] = action.payload;
        }
      })
      .addCase(approveSchool.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Reject School
    builder
      .addCase(rejectSchool.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(rejectSchool.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.schools.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.schools[index] = action.payload;
        }
      })
      .addCase(rejectSchool.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Activate School
    builder
      .addCase(activateSchool.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(activateSchool.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.schools.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.schools[index] = action.payload;
        }
      })
      .addCase(activateSchool.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Deactivate School
    builder
      .addCase(deactivateSchool.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(deactivateSchool.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.schools.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.schools[index] = action.payload;
        }
      })
      .addCase(deactivateSchool.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // ========================================================================
    // Bulk Operations
    // ========================================================================

    builder
      .addCase(bulkOperation.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(bulkOperation.fulfilled, (state) => {
        state.isUpdating = false;
        state.selectedSchoolIds = [];
        state.error = null;
      })
      .addCase(bulkOperation.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Bulk Delete
    builder
      .addCase(bulkDeleteSchools.pending, (state) => {
        state.isDeleting = true;
      })
      .addCase(bulkDeleteSchools.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.selectedSchoolIds = [];
        state.pagination.total -= action.payload.successCount;
      })
      .addCase(bulkDeleteSchools.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });

    // Bulk Approve
    builder
      .addCase(bulkApproveSchools.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(bulkApproveSchools.fulfilled, (state) => {
        state.isUpdating = false;
        state.selectedSchoolIds = [];
      })
      .addCase(bulkApproveSchools.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Bulk Reject
    builder
      .addCase(bulkRejectSchools.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(bulkRejectSchools.fulfilled, (state) => {
        state.isUpdating = false;
        state.selectedSchoolIds = [];
      })
      .addCase(bulkRejectSchools.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // ========================================================================
    // Statistics
    // ========================================================================

    builder
      .addCase(fetchSchoolStatistics.pending, (state) => {
        state.isFetchingStats = true;
        state.error = null;
      })
      .addCase(fetchSchoolStatistics.fulfilled, (state, action) => {
        state.isFetchingStats = false;
        state.statistics = action.payload;
        state.error = null;
      })
      .addCase(fetchSchoolStatistics.rejected, (state, action) => {
        state.isFetchingStats = false;
        state.error = action.payload as string;
      });

    // ========================================================================
    // File Operations
    // ========================================================================

    // Upload Logo
    builder
      .addCase(uploadSchoolLogo.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(uploadSchoolLogo.fulfilled, (state) => {
        state.isUpdating = false;
      })
      .addCase(uploadSchoolLogo.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Upload Document
    builder
      .addCase(uploadSchoolDocument.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(uploadSchoolDocument.fulfilled, (state) => {
        state.isUpdating = false;
      })
      .addCase(uploadSchoolDocument.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Bulk Import
    builder
      .addCase(bulkImportSchools.pending, (state) => {
        state.isCreating = true;
      })
      .addCase(bulkImportSchools.fulfilled, (state, action) => {
        state.isCreating = false;
        state.pagination.total += action.payload.successCount;
      })
      .addCase(bulkImportSchools.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Export
    builder
      .addCase(exportSchools.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(exportSchools.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(exportSchools.rejected, (state, action) => {
        state.isLoading = false;
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
  setPagination,
  selectSchools,
  toggleSchoolSelection,
  selectAllSchools,
  clearSelection,
  clearCurrentSchool,
  clearErrors,
  resetSchoolsState,
} = schoolsSlice.actions;

export default schoolsSlice.reducer;
