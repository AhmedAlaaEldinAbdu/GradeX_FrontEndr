import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomImage from '@/shared/components/CustomImage';
// import SearchInput from '@/shared/components/SearchInput';
import ChevronDownGray9Icon from '@/assets/icons/ChevronDownGray9.svg';
// import FilterDarkGreen14Icon from '@/assets/icons/FilterDarkGreen14.svg';
// import SearchGraySmIcon from '@/assets/icons/SearchGraySm.svg';
// import CancelXGreenIcon from '@gradex/assets/icons/CancelXGreen.svg';
// import {
//   FILTER_SEARCH_ICON_CLASS,
//   FILTER_SEARCH_INPUT_CLASS,
// } from './AcademicCalendarFilterControls';

export type WeeklyFilterOption = { value: string; label: string };

type FilterPillProps = {
  label: string;
  value: string;
  options: WeeklyFilterOption[];
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  allLabel?: string;
};

function FilterPill({
  label,
  value,
  options: baseOptions,
  onChange,
  placeholder,
  disabled,
  allLabel,
}: FilterPillProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const options = allLabel ? [{ value: '', label: allLabel }, ...baseOptions] : baseOptions;
  const selectedLabel = options.find((option) => option.value === value)?.label;

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-[11px] py-[7px] text-xs leading-4 whitespace-nowrap transition-colors hover:bg-[#F1F5F9] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="flex items-center gap-1">
          <span className="text-[#9D9D9D]">{label}</span>
          <span className={`font-medium ${selectedLabel ? 'text-[black]' : 'text-[#9D9D9D]'}`}>
            {selectedLabel ?? placeholder}
          </span>
        </span>
        <span className="flex size-3.5 items-center justify-center">
          <CustomImage
            src={ChevronDownGray9Icon}
            alt=""
            className={`transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      {open ? (
        <ul
          role="listbox"
          className="absolute start-0 top-full z-30 mt-1 max-h-64 min-w-full overflow-y-auto rounded-lg border border-[#E2E8F0] bg-white py-1 shadow-lg"
        >
          {options.length === 0 ? (
            <li className="px-3 py-2 text-xs whitespace-nowrap text-[#9D9D9D]">
              {t('weeklyCalendar.filters.noOptions')}
            </li>
          ) : (
            options.map((option) => (
              <li key={option.value} role="option" aria-selected={option.value === value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-start text-xs font-medium whitespace-nowrap transition-colors ${
                    option.value === value
                      ? 'bg-[#ECFDF5] text-[#1E7A52]'
                      : 'text-[#1E293B] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {option.label}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}

type WeeklyCalendarFiltersProps = {
  subSystemId: string;
  stageId: string;
  gradeId: string;
  classroomId: string;
  subSystemOptions: WeeklyFilterOption[];
  stageOptions: WeeklyFilterOption[];
  gradeOptions: WeeklyFilterOption[];
  classroomOptions: WeeklyFilterOption[];
  onSubSystemChange: (value: string) => void;
  onStageChange: (value: string) => void;
  onGradeChange: (value: string) => void;
  onClassroomChange: (value: string) => void;
  isGradesLoading?: boolean;
  isClassroomsLoading?: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onReset: () => void;
};

export default function WeeklyCalendarFilters({
  subSystemId,
  stageId,
  gradeId,
  classroomId,
  subSystemOptions,
  stageOptions,
  gradeOptions,
  classroomOptions,
  onSubSystemChange,
  onStageChange,
  onGradeChange,
  onClassroomChange,
  isGradesLoading = false,
  isClassroomsLoading = false,
  // searchTerm,
  // onSearchChange,
  // onReset,
}: WeeklyCalendarFiltersProps) {
  const { t } = useTranslation();
  // const hasActiveFilters = Boolean(subSystemId || stageId || gradeId || classroomId || searchTerm);
  // const [moreOpen, setMoreOpen] = useState(Boolean(searchTerm));

  return (
    <>
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <FilterPill
              label={t('weeklyCalendar.filters.systemLabel')}
              value={subSystemId}
              options={subSystemOptions}
              onChange={onSubSystemChange}
              placeholder={t('weeklyCalendar.filters.all')}
              allLabel={t('weeklyCalendar.filters.all')}
            />
            <FilterPill
              label={t('weeklyCalendar.filters.stageLabel')}
              value={stageId}
              options={stageOptions}
              onChange={onStageChange}
              placeholder={t('weeklyCalendar.filters.all')}
              allLabel={t('weeklyCalendar.filters.all')}
            />
            <FilterPill
              label={t('weeklyCalendar.filters.gradeLabel')}
              value={gradeId}
              options={gradeOptions}
              onChange={onGradeChange}
              placeholder={
                isGradesLoading ? t('common.loading') : t('weeklyCalendar.filters.choose')
              }
              disabled={isGradesLoading}
            />
            <FilterPill
              label={t('weeklyCalendar.filters.sectionLabel')}
              value={classroomId}
              options={classroomOptions}
              onChange={onClassroomChange}
              placeholder={
                !gradeId
                  ? t('weeklyCalendar.filters.chooseGradeFirst')
                  : isClassroomsLoading
                    ? t('common.loading')
                    : t('weeklyCalendar.filters.choose')
              }
              disabled={!gradeId || isClassroomsLoading}
            />
          </div>

          {/* <button
            type="button"
            onClick={() => setMoreOpen((open) => !open)}
            aria-expanded={moreOpen}
            className={`relative flex items-center gap-1.5 rounded-lg border border-[#1E7A52] px-[13px] py-[7px] text-xs leading-4 font-medium whitespace-nowrap text-[#027A48] transition-colors hover:bg-[#D1FAE5] ${
              moreOpen ? 'bg-[#D1FAE5]' : 'bg-[#ECFDF5]'
            }`}
          >
            <CustomImage src={FilterDarkGreen14Icon} alt="" />
            {t('weeklyCalendar.filters.moreFilters')}
            {searchTerm ? (
              <span className="absolute -end-1 -top-1 size-2 rounded-full bg-[#1E7A52]" />
            ) : null}
          </button> */}
        </div>
      </div>
      {/* 
      {moreOpen ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white px-[15px] py-[9px]">
          <SearchInput
            name="weekly-calendar-search"
            value={searchTerm}
            onChange={onSearchChange}
            placeholder={t('weeklyCalendar.filters.searchPlaceholder')}
            iconSrc={SearchGraySmIcon}
            iconClass={FILTER_SEARCH_ICON_CLASS}
            wrapperClassName="md:w-[280px] w-full"
            className={FILTER_SEARCH_INPUT_CLASS}
          />
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={onReset}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-[#1E7A52] bg-[#ECFDF5] px-[13px] text-xs leading-4 font-medium whitespace-nowrap text-[#1E7A52] transition-colors hover:bg-[#D1FAE5]"
            >
              <img src={CancelXGreenIcon} alt="" aria-hidden="true" className="h-3.5 w-3.5" />
              {t('actions.clearFilter')}
            </button>
          ) : null}
        </div>
      ) : null} */}
    </>
  );
}
