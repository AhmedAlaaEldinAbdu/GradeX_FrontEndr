import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/useLanguage';
import CustomImage from '@/shared/components/CustomImage';
import ChevronLeftGraySmIcon from '@/assets/icons/ChevronLeftGraySm.svg';
import ChevronRightGraySmIcon from '@/assets/icons/ChevronRightGraySm.svg';

type AcademicCalendarPaginationProps = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const PAGE_BUTTON_CLASS =
  'flex size-8 shrink-0 items-center justify-center rounded-[4.6px] border border-[#E2E8F0] bg-white text-sm leading-[18.4px] text-[#9D9D9D] transition-colors hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50';

const getPages = (page: number, totalPages: number): (number | 'dots')[] => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

  if (page <= 4) return [1, 2, 3, 4, 5, 'dots', totalPages];
  if (page >= totalPages - 3)
    return [1, 'dots', ...Array.from({ length: 5 }, (_, i) => totalPages - 4 + i)];
  return [1, 'dots', page - 1, page, page + 1, 'dots', totalPages];
};

export default function AcademicCalendarPagination({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
}: AcademicCalendarPaginationProps) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const pageCount = Math.max(totalPages, 1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0]/80 bg-[#F8FAFC]/50 px-6 pt-[13px] pb-3">
      <span className="text-sm leading-[19.6px] font-semibold text-[#9D9D9D]">
        {t('academicCalendar.showingRange', { from, to, total })}
      </span>

      <div className="flex items-center gap-[4.6px]">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label={t('actions.previous')}
          className={PAGE_BUTTON_CLASS}
        >
          <CustomImage
            src={isRTL ? ChevronRightGraySmIcon : ChevronLeftGraySmIcon}
            alt=""
            className="h-4 w-4"
          />
        </button>

        {getPages(page, pageCount).map((item, index) =>
          item === 'dots' ? (
            <span
              key={`dots-${index}`}
              className="px-[4.6px] text-[13.8px] leading-[18.4px] text-[#9D9D9D] select-none"
            >
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === page ? 'page' : undefined}
              className={
                item === page
                  ? `${PAGE_BUTTON_CLASS} border-[#1E7A52]! bg-[#ECFDF5]! font-medium text-[#1E7A52]!`
                  : PAGE_BUTTON_CLASS
              }
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          aria-label={t('actions.next')}
          className={PAGE_BUTTON_CLASS}
        >
          <CustomImage
            src={isRTL ? ChevronLeftGraySmIcon : ChevronRightGraySmIcon}
            alt=""
            className="h-4 w-4"
          />
        </button>
      </div>
    </div>
  );
}
