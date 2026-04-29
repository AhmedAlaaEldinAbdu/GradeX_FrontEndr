import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/useLanguage';
import ArrowRightIcon from '@gradex/assets/icons/ArrowRight.svg';
import ArrowLeftIcon from '@gradex/assets/icons/ArrowLeft.svg';
import CustomImage from '@/shared/components/CustomImage';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  from?: number;
  to?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  from,
  to,
}) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const getPages = (): (number | string)[] => {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    if (currentPage <= 2) {
      pages.push(1, 2, '...', totalPages - 1, totalPages);
      return pages;
    }
    if (currentPage >= totalPages - 1) {
      pages.push(1, 2, '...', totalPages - 1, totalPages);
      return pages;
    }
    pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    return pages;
  };

  const pages = getPages();

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm font-medium">
      <div className="text-gray-500">
        <span>{t('actions.view')} </span>
        <span className="">{currentPage}</span>
        <span className="mx-1">{t('actions.to')}</span>
        <span className="">{to}</span>
        <span className="mx-1">{t('actions.from')}</span>
        <span className="">{from}</span>
        <span className="mx-1">{t('actions.entries')}</span>
      </div>

      {/* Right side (pagination buttons) */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center gap-1 rounded px-3 py-1.5 transition-colors ${
            currentPage === 1
              ? 'cursor-not-allowed text-gray-300'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <CustomImage
            src={isRTL ? ArrowRightIcon : ArrowLeftIcon}
            alt="ArrowIcon"
            className={currentPage === 1 ? 'opacity-30' : ''}
          />
          <span>{t('actions.previous')}</span>
        </button>

        {/* Page Numbers */}
        {pages &&
          pages?.map((page, index) =>
            page === '...' ? (
              <span key={`dots-${index}`} className="select-none px-2 text-gray-400">
                {page}
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                disabled={currentPage === page}
                className={`min-w-[36px] rounded-md px-3 py-1.5 text-center transition-colors ${
                  currentPage === page
                    ? 'cursor-default border bg-white text-green-500'
                    : 'cursor-pointer text-gray-500 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            )
          )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center gap-1 rounded px-3 py-1.5 transition-colors ${
            currentPage === totalPages
              ? 'cursor-not-allowed text-gray-300'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span>{t('actions.next')}</span>
          <CustomImage
            src={isRTL ? ArrowLeftIcon : ArrowRightIcon}
            alt="ArrowIcon"
            className={currentPage === totalPages ? 'opacity-30' : ''}
          />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
