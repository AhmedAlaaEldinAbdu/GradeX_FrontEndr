/**
 * Schools API Service
 * Unified export for all school-related API operations
 */

// CRUD Operations
export * from './crud.service';

// Status Management
export * from './status.service';

// File Upload
export * from './upload.service';

// Data Transformers
export * from './transformers';

// Convenience object export
import * as crudService from './crud.service';
import * as statusService from './status.service';
import * as uploadService from './upload.service';
import * as transformers from './transformers';

export const schoolsApi = {
  ...crudService,
  ...statusService,
  ...uploadService,
  ...transformers,
};
