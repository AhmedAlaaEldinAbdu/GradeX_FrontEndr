import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/useLanguage';
import CustomImage from '@/shared/components/CustomImage';
import ChevronDownGray18Icon from '@/assets/icons/ChevronDownGray18.svg';
import PaginationPrevGrayIcon from '@/assets/icons/PaginationPrevGray16.svg';
import PaginationNextGrayIcon from '@/assets/icons/PaginationNextGray16.svg';

const PAGE_BUTTON_CLASS =
  'flex size-8 shrink-0 items-center justify-center rounded-lg border border-[#E2E8F0] text-xs leading-4 font-semibold text-[#9D9D9D] transition-colors hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50';

const getPages = (page: number, totalPages: number): (number | 'dots')[] => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, 'dots', totalPages];
  if (page >= totalPages - 3)
    return [1, 'dots', ...Array.from({ length: 5 }, (_, i) => totalPages - 4 + i)];
  return [1, 'dots', page - 1, page, page + 1, 'dots', totalPages];
};

type TablePaginationFooterProps = {
  page: number;
  limit: number;
  total: number;
  rowsPerPageOptions: number[];
  /** Translation key taking `{{from}}`, `{{to}}` and `{{total}}`. */
  showingLabelKey: string;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

function RowsPerPageSelect({
  value,
  options,
  onChange,
}: {
  value: number;
  options: number[];
  onChange: (value: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-8 w-[57px] items-center justify-center gap-1 rounded-lg border border-[#E2E8F0] bg-white text-xs leading-4 font-semibold text-[#9D9D9D]"
      >
        <CustomImage src={ChevronDownGray18Icon} alt="" />
        {value}
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute bottom-full z-20 mb-1 min-w-full overflow-hidden rounded-lg border border-[#E2E8F0] bg-white py-1 shadow-lg"
        >
          {options.map((option) => (
            <li key={option} role="option" aria-selected={option === value}>
              <button
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`w-full px-3 py-1.5 text-center text-xs font-semibold ${
                  option === value
                    ? 'bg-[#ECFDF5] text-[#1E7A52]'
                    : 'text-[#9D9D9D] hover:bg-[#F8FAFC]'
                }`}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default function TablePaginationFooter({
  page,
  limit,
  total,
  rowsPerPageOptions,
  showingLabelKey,
  onPageChange,
  onLimitChange,
}: TablePaginationFooterProps) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const pageCount = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t border-[#F1F5F9] bg-white px-4 pt-[17px] pb-4">
      <div className="flex items-center gap-2 text-sm leading-4 text-[#9D9D9D]">
        <RowsPerPageSelect value={limit} options={rowsPerPageOptions} onChange={onLimitChange} />
        <span>{t(showingLabelKey, { from, to, total })}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label={t('actions.previous')}
          className={`${PAGE_BUTTON_CLASS} ${isRTL ? 'rotate-180' : ''}`}
        >
          <CustomImage src={PaginationPrevGrayIcon} alt="" />
        </button>
        {getPages(page, pageCount).map((item, index) =>
          item === 'dots' ? (
            <span key={`dots-${index}`} className="px-1 text-xs text-[#9D9D9D] select-none">
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
                  ? `${PAGE_BUTTON_CLASS} border-[#1E7A52]! bg-[#ECFDF5] font-bold! text-[#1E7A52]!`
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
          className={`${PAGE_BUTTON_CLASS} ${isRTL ? 'rotate-180' : ''}`}
        >
          <CustomImage src={PaginationNextGrayIcon} alt="" />
        </button>
      </div>
    </div>
  );
}
