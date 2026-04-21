import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/useLanguage';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const { t } = useTranslation();
  const { direction } = useLanguage();

  return (
    <nav
      className="mb-6 flex items-center gap-2 text-sm font-normal text-gray-600"
      dir={direction}
    >
      {items?.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="text-gray-400">/</span>}

          {item.path ? (
            <Link
              to={item.path}
              className="font-normal text-black-600 transition-colors hover:text-[#646969]"
            >
              {t(item.label)}
            </Link>
          ) : (
            <span
              className={`font-normal ${items.length === index + 1 ? 'text-black-900' : 'text-[#646969]'}`}
            >
              {t(item.label)}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
