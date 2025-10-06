import React from "react";
import { Link } from "react-router-dom";
import { FaHome } from "react-icons/fa";

interface BreadcrumbItem {
   label: string;
   path?: string;
}

interface BreadcrumbProps {
   items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
   return (
      <nav
         className="flex items-center gap-2 text-sm text-gray-600 mb-6"
         dir="rtl"
      >
         <Link
            to="/"
            className="flex items-center gap-1 hover:text-green-600 transition-colors"
         >
            <FaHome className="text-lg" />
            <span>الرئيسية</span>
         </Link>
         {items.map((item, index) => (
            <React.Fragment key={index}>
               <span className="text-gray-400">/</span>
               {item.path ? (
                  <Link
                     to={item.path}
                     className="hover:text-green-600 transition-colors"
                  >
                     {item.label}
                  </Link>
               ) : (
                  <span className="text-gray-800 font-medium">
                     {item.label}
                  </span>
               )}
            </React.Fragment>
         ))}
      </nav>
   );
};

export default Breadcrumb;
