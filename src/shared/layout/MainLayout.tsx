import React from 'react';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar.tsx';
import Header from './Header.tsx';
import { selectUserRole } from '@gradex/redux/features/auth/authSelectors';
import { UserRole } from '@gradex/constants/roles';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const userRole = useSelector(selectUserRole);
  const dashboardType = userRole || UserRole.SCHOOL_ADMIN;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50" dir="rtl">
      {/* Sidebar - appears on the left side */}
      <Sidebar dashboardType={dashboardType} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
