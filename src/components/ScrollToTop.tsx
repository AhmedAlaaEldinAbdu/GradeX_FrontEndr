import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets window scroll on every path change. Covers pages rendered outside
 * MainLayout (auth pages) — dashboard pages scroll inside MainContainer's
 * <main>, which resets itself (see shared/layout/Container.tsx).
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
