import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar.tsx';
import Header from './Header.tsx';
import { selectUserRole } from '@gradex/redux/features/auth/authSelectors';
import { UserRole } from '@gradex/constants/roles';
import MainContainer from './Container.tsx';
import { useLanguage } from '@/hooks/useLanguage';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const userRole = useSelector(selectUserRole);
  const dashboardType = userRole || UserRole.SCHOOL_ADMIN;
  const { direction } = useLanguage();
  // Mobile drawer state — the Header's menu button opens it, the Sidebar closes it.
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const openMobileNav = useCallback(() => setIsMobileNavOpen(true), []);
  const closeMobileNav = useCallback(() => setIsMobileNavOpen(false), []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50" dir={direction}>
      {/* Sidebar - appears on the left side */}
      <Sidebar
        dashboardType={dashboardType}
        isMobileOpen={isMobileNavOpen}
        onMobileClose={closeMobileNav}
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header onMenuClick={openMobileNav} />

        {/* Page Content */}
        <MainContainer>{children}</MainContainer>
      </div>
    </div>
  );
};

export default MainLayout;
