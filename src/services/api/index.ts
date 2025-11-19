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
export * from './users/users.service';
export * from './official-holidays/official-holidays.service';

// Types
export * from './types/auth.types';
export * from './types/school.types';
export * from './types/roles.types';
export * from './types/permissions.types';
export * from './types/users.types';
export * from './types/official-holidays.types';

// Endpoints
export * from './endpoints/auth-endpoints';
export * from './endpoints/schools-endpoints';
export * from './endpoints/roles-endpoints';
export * from './endpoints/permissions-endpoints';
export * from './endpoints/users-endpoints';
export * from './endpoints/official-holidays-endpoints';
