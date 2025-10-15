/**
 * API Services Index
 * Central export point for all API services
 */

// Config
export * from './config';

// Interceptors
export * from './interceptors';

// Services
export * from './schools';

// Types
export * from './types/school.types';

// Initialize interceptors
import { setupInterceptors } from './interceptors';
setupInterceptors();
