import React from 'react';
import { Link } from 'react-router-dom';
// import { FaHome } from 'react-icons/fa';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="mb-6 flex items-center gap-2 text-sm text-gray-600" dir="rtl">
      <Link to="/" className="flex items-center gap-1 transition-colors hover:text-green-600">
        {/* <FaHome className="text-lg" /> */}
        <span>الرئيسية</span>
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <span className="text-gray-400">/</span>
          {item.path ? (
            <Link to={item.path} className="transition-colors hover:text-green-600">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-gray-800">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
