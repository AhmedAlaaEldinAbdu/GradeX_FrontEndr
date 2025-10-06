import React from "react";
import Sidebar from "./Sidebar.tsx";
import Header from "./Header.tsx";

interface MainLayoutProps {
   children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
   return (
      <div className="flex h-screen bg-gray-50 overflow-hidden" dir="rtl">
         {/* Sidebar - appears on the left side */}
         <Sidebar />

         {/* Main Content Area */}
         <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <Header />

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
               {children}
            </main>
         </div>
      </div>
   );
};

export default MainLayout;
