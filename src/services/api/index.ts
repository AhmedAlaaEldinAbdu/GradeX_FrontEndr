/**
 * API Services Index
 * Central export point for all API services
 */

// Config
export * from './config';

// Services
export * from './auth/auth.service';
export * from './schools/schools.service';

// Types
export * from './types/auth.types';
export * from './types/school.types';

// Endpoints
export * from './endpoints/auth-endpoints';
export * from './endpoints/schools-endpoints';
