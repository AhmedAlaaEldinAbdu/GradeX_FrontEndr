import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import Button from '@/shared/components/Button';
import CustomImage from '@/shared/components/CustomImage';
import CustomSelect, { type CustomSelectOption } from '@/shared/components/CustomSelect';
import SearchInput from '@/shared/components/SearchInput';
import PlusWhite16Icon from '@/assets/icons/PlusWhite16.svg';
import PrinterGreenIcon from '@/assets/icons/PrinterGreen.svg';
import ChevronLeftBlackIcon from '@/assets/icons/ChevronLeftBlack.svg';
import ChevronRightBlackIcon from '@/assets/icons/ChevronRightBlack.svg';
import CalendarAkarGreen12Icon from '@/assets/icons/CalendarAkarGreen12.svg';
import ChevronDownGreen12Icon from '@/assets/icons/ChevronDownGreen12.svg';
import FilterGreenIcon from '@/assets/icons/FilterGreen.svg';
import SearchGraySmIcon from '@/assets/icons/SearchGraySm.svg';
import CancelXGreenIcon from '@gradex/assets/icons/CancelXGreen.svg';
import {
  FILTER_SEARCH_ICON_CLASS,
  FILTER_SEARCH_INPUT_CLASS,
} from './AcademicCalendarFilterControls';
import {
  MONTHLY_SEARCH_PARAM,
  MONTHLY_STAGE_PARAM,
  type MonthlyTypeFilter,
} from './MonthlyCalendarItems';

const GREEN_PILL =
  'flex h-8 items-center gap-2 rounded-lg border border-[#1E7A52] bg-[#ECFDF5] px-[13px] text-xs leading-4 font-medium whitespace-nowrap text-[#1E7A52] transition-colors hover:bg-[#D1FAE5]';
const NAV_BUTTON =
  'flex size-7 items-center justify-center rounded-md border border-[#E2E8F0] transition-colors hover:bg-[#F8FAFC]';

const STAGE_SELECT_TRIGGER =
  'h-[38px]! min-h-[38px]! rounded-lg! border-[#E2E8F0]! bg-[#F8FAFC]! px-[13px]! py-0! text-sm! font-medium! [&_span]:font-medium! [&_span]:text-[#1E293B]!';

const TYPE_OPTIONS: MonthlyTypeFilter[] = ['all', 'events', 'holidays'];
const TYPE_LABEL_KEYS: Record<MonthlyTypeFilter, string> = {
  all: 'monthlyCalendar.board.typeAll',
  events: 'monthlyCalendar.board.typeEvents',
  holidays: 'monthlyCalendar.board.typeHolidays',
};

type MonthlyCalendarToolbarProps = {
  monthLabel: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onAddEvent: () => void;
  onPrint: () => void;
  onOpenSettings: () => void;
  typeFilter: MonthlyTypeFilter;
  onTypeFilterChange: (value: MonthlyTypeFilter) => void;
  stageOptions: CustomSelectOption[];
  isStageOptionsLoading?: boolean;
};

export default function MonthlyCalendarToolbar({
  monthLabel,
  onPreviousMonth,
  onNextMonth,
  onAddEvent,
  onPrint,
  typeFilter,
  onTypeFilterChange,
  stageOptions,
  isStageOptionsLoading = false,
}: MonthlyCalendarToolbarProps) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const typeMenuRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get(MONTHLY_SEARCH_PARAM) ?? '';
  const stageFilter = searchParams.get(MONTHLY_STAGE_PARAM) ?? '';
  const hasActiveFilters = Boolean(searchTerm.trim() || stageFilter);
  const [filtersOpen, setFiltersOpen] = useState(hasActiveFilters);
  if (hasActiveFilters && !filtersOpen) {
    setFiltersOpen(true);
  }

  const updateParam = (key: string, value: string) => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
        return next;
      },
      { replace: true }
    );
  };

  const handleResetFilters = () => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.delete(MONTHLY_SEARCH_PARAM);
        next.delete(MONTHLY_STAGE_PARAM);
        return next;
      },
      { replace: true }
    );
  };

  useEffect(() => {
    if (!typeMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (typeMenuRef.current && !typeMenuRef.current.contains(event.target as Node)) {
        setTypeMenuOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setTypeMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [typeMenuOpen]);

  return (
    <>
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-[#E2E8F0] bg-white px-[15px] py-[9px] md:grid-cols-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            actionKey="add"
            onClick={onAddEvent}
            icon={<CustomImage src={PlusWhite16Icon} alt="" className="block" />}
            className="h-9 gap-2 rounded-lg! border-0! bg-[#1E7A52]! px-4! py-2! text-sm! leading-[19.6px] font-medium! text-white! shadow-none! drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] hover:bg-[#1E7A52]/90!"
          >
            {t('monthlyCalendar.addEventButton')}
          </Button>

          <button
            type="button"
            onClick={onPrint}
            aria-label={t('monthlyCalendar.board.print')}
            title={t('monthlyCalendar.board.print')}
            className="flex items-center justify-center rounded-lg border border-[#1E7A52] bg-[#ECFDF5] px-[9px] py-[5px] transition-colors hover:bg-[#D1FAE5]"
          >
            <CustomImage src={PrinterGreenIcon} alt={t('monthlyCalendar.board.print')} />
          </button>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onPreviousMonth}
            aria-label={t('monthlyCalendar.board.previousMonth')}
            className={NAV_BUTTON}
          >
            <CustomImage src={isRTL ? ChevronRightBlackIcon : ChevronLeftBlackIcon} alt="" />
          </button>
          <h2 className="min-w-[100px] px-3.5 text-center text-base leading-6 font-bold tracking-[-0.4px] whitespace-nowrap text-[black]">
            {monthLabel}
          </h2>
          <button
            type="button"
            onClick={onNextMonth}
            aria-label={t('monthlyCalendar.board.nextMonth')}
            className={NAV_BUTTON}
          >
            <CustomImage src={isRTL ? ChevronLeftBlackIcon : ChevronRightBlackIcon} alt="" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 md:justify-end">
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            className={`${GREEN_PILL} relative w-[48%] gap-1.5 md:w-auto ${filtersOpen ? 'bg-[#D1FAE5]' : ''}`}
          >
            <CustomImage src={FilterGreenIcon} alt="" />
            {t('monthlyCalendar.board.filter')}
            {hasActiveFilters ? (
              <span className="absolute -end-1 -top-1 size-2 rounded-full bg-[#1E7A52]" />
            ) : null}
          </button>

          <div ref={typeMenuRef} className="relative w-[48%] md:w-auto">
            <button
              type="button"
              onClick={() => setTypeMenuOpen((open) => !open)}
              aria-haspopup="listbox"
              aria-expanded={typeMenuOpen}
              className={`${GREEN_PILL} w-full`}
            >
              <span className="flex items-center gap-1">
                <CustomImage src={CalendarAkarGreen12Icon} alt="" />
                {t(TYPE_LABEL_KEYS[typeFilter])}
              </span>
              <CustomImage
                src={ChevronDownGreen12Icon}
                alt=""
                className={`transition-transform ${typeMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {typeMenuOpen ? (
              <ul
                role="listbox"
                className="absolute end-0 top-full z-20 mt-1 min-w-full overflow-hidden rounded-lg border border-[#E2E8F0] bg-white py-1 shadow-lg"
              >
                {TYPE_OPTIONS.map((option) => (
                  <li key={option} role="option" aria-selected={option === typeFilter}>
                    <button
                      type="button"
                      onClick={() => {
                        onTypeFilterChange(option);
                        setTypeMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-start text-xs font-medium whitespace-nowrap transition-colors ${
                        option === typeFilter
                          ? 'bg-[#ECFDF5] text-[#1E7A52]'
                          : 'text-[#1E293B] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      {t(TYPE_LABEL_KEYS[option])}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>

      {filtersOpen ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white px-[15px] py-[9px]">
          <SearchInput
            name="monthly-calendar-search"
            value={searchTerm}
            onChange={(value) => updateParam(MONTHLY_SEARCH_PARAM, value.trim())}
            placeholder={t('monthlyCalendar.searchPlaceholder')}
            iconSrc={SearchGraySmIcon}
            iconClass={FILTER_SEARCH_ICON_CLASS}
            wrapperClassName="md:w-[250px] w-full"
            className={FILTER_SEARCH_INPUT_CLASS}
          />
          <CustomSelect
            value={stageFilter}
            onChange={(value) =>
              updateParam(MONTHLY_STAGE_PARAM, Array.isArray(value) ? (value[0] ?? '') : value)
            }
            options={stageOptions}
            placeholder={t('monthlyCalendar.filters.stagePlaceholder')}
            className="w-full md:w-[180px]"
            triggerClassName={STAGE_SELECT_TRIGGER}
            showSearch={false}
            disabled={isStageOptionsLoading}
          />
          {hasActiveFilters ? (
            <button type="button" onClick={handleResetFilters} className={`${GREEN_PILL} gap-1.5`}>
              <img src={CancelXGreenIcon} alt="" aria-hidden="true" className="h-3.5 w-3.5" />
              {t('actions.clearFilter')}
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
