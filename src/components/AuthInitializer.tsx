import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { restoreSession } from '@gradex/redux/features/auth/authSlice';
import { selectIsInitialized } from '@gradex/redux/features/auth/authSelectors';
import type { AppDispatch } from '@gradex/redux/store/store';

/**
 * AuthInitializer Component
 * Restores user session from storage on app initialization
 * This component should be rendered once at the root level
 */
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const isInitialized = useSelector(selectIsInitialized);

  useEffect(() => {
    // Try to restore session from storage
    dispatch(restoreSession());
  }, [dispatch]);

  // Show loading screen while restoring session (before initialization)
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-[#E6FBF5] via-[#DFF8EE] to-[#E8F9F0]">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-[#1FAD6C] border-t-transparent"></div>
          <p className="text-lg font-medium text-[#1FAD6C]">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthInitializer;
