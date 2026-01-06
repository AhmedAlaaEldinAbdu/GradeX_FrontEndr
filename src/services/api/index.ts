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
export * from './job-advertisments/job-advertisments.service';
export * from './monthly-calendar/monthly-calendar.service';

// Types
export * from './types/auth.types';
export * from './types/school.types';
export * from './types/roles.types';
export * from './types/permissions.types';
export * from './types/users.types';
export * from './types/official-holidays.types';
export * from './types/job-advertisment.types';
export * from './types/monthly-calendar.types';

// Endpoints
export * from './endpoints/auth-endpoints';
export * from './endpoints/schools-endpoints';
export * from './endpoints/roles-endpoints';
export * from './endpoints/permissions-endpoints';
export * from './endpoints/users-endpoints';
export * from './endpoints/official-holidays-endpoints';
export * from './endpoints/job-advertisment-endpoints';
export * from './endpoints/monthly-calendar-endpoints';
