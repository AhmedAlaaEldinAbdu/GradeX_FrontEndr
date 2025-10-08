import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const { t } = useTranslation();

  return (
    <nav className="mb-6 flex items-center gap-2 text-sm text-gray-600" dir="rtl">
      {items?.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="text-gray-400">/</span>}

          {item.path ? (
            <Link to={item.path} className="transition-colors font-medium text-gray-500 hover:text-gray-800">
              {t(item.label)}
            </Link>
          ) : (
            <span className={`font-medium ${items.length === index+1 ? "text-gray-800" : "text-gray-500"}`}>{t(item.label)}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
