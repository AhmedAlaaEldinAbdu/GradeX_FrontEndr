/**
 * API Services Index
 * Central export point for all API services
 */

// Config
export * from './config';

// Services
export * from './auth/auth.service';
export * from './schools/schools.service';
export * from './roles/roles.service';
export * from './permissions/permissions.service';

// Types
export * from './types/auth.types';
export * from './types/school.types';
export * from './types/roles.types';
export * from './types/permissions.types';

// Endpoints
export * from './endpoints/auth-endpoints';
export * from './endpoints/schools-endpoints';
export * from './endpoints/roles-endpoints';
export * from './endpoints/permissions-endpoints';
