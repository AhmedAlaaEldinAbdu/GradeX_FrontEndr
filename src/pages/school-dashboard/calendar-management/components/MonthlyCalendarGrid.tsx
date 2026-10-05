import { useMemo } from 'react';
import { addDays, isSameMonth } from 'date-fns';
import { useTranslation } from 'react-i18next';
import ActionsDropdown, { type Action } from '@/shared/components/ActionsDropdown';
import DotsVerticalGray12Icon from '@/assets/icons/DotsVerticalGray12.svg';
import DotsVerticalGray14Icon from '@/assets/icons/DotsVerticalGray14.svg';
import {
  DAYS_IN_GRID,
  TONE_STYLES,
  formatMonthName,
  formatWeekday,
  getGridRange,
  toDayKey,
  type MonthlyCalendarItem,
} from './MonthlyCalendarItems';

const VISIBLE_CHIPS_PER_DAY = 2;

type MonthlyCalendarGridProps = {
  month: Date;
  selectedDay: string;
  itemsByDay: Map<string, MonthlyCalendarItem[]>;
  isLoading?: boolean;
  canAddOn: (date: Date) => boolean;
  onSelectDay: (date: Date) => void;
  onItemClick: (item: MonthlyCalendarItem) => void;
  onAddEvent: (date: Date) => void;
  onViewDay: (dayKey: string) => void;
};

function EventChip({
  item,
  onClick,
}: {
  item: MonthlyCalendarItem;
  onClick: (item: MonthlyCalendarItem) => void;
}) {
  const tone = TONE_STYLES[item.tone];
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick(item);
      }}
      title={item.title}
      className={`flex w-full flex-col gap-2 rounded-md border p-[9px] text-start transition-shadow hover:shadow-sm ${tone.chip}`}
    >
      <span className={`w-full truncate font-semibold ${tone.title}`}>{item.title}</span>
      <span className="flex items-center gap-1">
        <span className={`size-1.5 shrink-0 rounded-full ${tone.dot}`} />
        <span className={`truncate text-[10px] leading-[12.5px] ${tone.label}`}>
          {item.chipLabel}
        </span>
      </span>
    </button>
  );
}

export default function MonthlyCalendarGrid({
  month,
  selectedDay,
  itemsByDay,
  isLoading = false,
  canAddOn,
  onSelectDay,
  onItemClick,
  onAddEvent,
  onViewDay,
}: MonthlyCalendarGridProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const todayKey = toDayKey(new Date());

  const days = useMemo(() => {
    const { start } = getGridRange(month);
    return Array.from({ length: DAYS_IN_GRID }, (_, index) => addDays(start, index));
  }, [month]);

  const dayActions = (date: Date, dayKey: string): Action[] => [
    {
      id: `add-${dayKey}`,
      label: t('monthlyCalendar.actions.addEvent'),
      actionKey: 'add',
      onClick: () => onAddEvent(date),
      hidden: !canAddOn(date),
    },
    {
      id: `view-${dayKey}`,
      label: t('monthlyCalendar.board.viewAllDayEvents'),
      onClick: () => onViewDay(dayKey),
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
      <div className="grid grid-cols-7 border-b border-[#E2E8F0] bg-[#F8FAFC]">
        {days.slice(0, 7).map((date, index) => (
          <div
            key={index}
            className={`py-2.5 text-center text-xs leading-4 font-medium text-[black] ${
              index < 6 ? 'border-e border-[#F1F5F9]' : ''
            }`}
          >
            {formatWeekday(date, language)}
          </div>
        ))}
      </div>

      <div role="grid" className="grid grid-cols-7">
        {days.map((date, index) => {
          const dayKey = toDayKey(date);
          const isOutside = !isSameMonth(date, month);
          const isSelected = dayKey === selectedDay;
          const isToday = dayKey === todayKey;
          const isLastColumn = index % 7 === 6;
          const isFirstRow = index < 7;
          const items = itemsByDay.get(dayKey) ?? [];
          const hiddenCount = items.length - VISIBLE_CHIPS_PER_DAY;
          const showMonthLabel =
            isOutside &&
            (date < month
              ? addDays(date, 1).getMonth() === month.getMonth()
              : date.getDate() === 1);

          return (
            <div
              key={dayKey}
              role="gridcell"
              aria-selected={isSelected}
              tabIndex={0}
              onClick={() => onSelectDay(date)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelectDay(date);
                }
              }}
              className={`group relative flex min-h-[105px] cursor-pointer flex-col gap-2 px-2 pt-[9px] pb-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#1E7A52]/40 focus-visible:ring-inset ${
                isLastColumn ? '' : 'border-e border-[#F1F5F9]'
              } ${isFirstRow ? '' : 'border-t border-[#F1F5F9]'} ${
                isSelected
                  ? 'rounded-lg bg-[#ECFDF5]/20 ring-2 ring-[#1E7A52]/15 ring-inset'
                  : isOutside
                    ? 'bg-[#F8FAFC]/50 hover:bg-[#F8FAFC]'
                    : 'hover:bg-[#F8FAFC]/60'
              }`}
            >
              <div className="flex min-h-5 items-center justify-between gap-1">
                <span
                  className={
                    isSelected
                      ? 'text-sm leading-5 font-bold text-[#065F46]'
                      : isOutside
                        ? 'text-xs leading-4 font-medium text-[#9D9D9D]'
                        : `text-xs leading-4 font-semibold ${isToday ? 'text-[#1E7A52]' : 'text-[black]'}`
                  }
                >
                  {String(date.getDate()).padStart(2, '0')}
                </span>
                <span className="flex items-center gap-1">
                  {showMonthLabel ? (
                    <span className="text-[10px] leading-4 text-[#9D9D9D]">
                      {formatMonthName(date, language)}
                    </span>
                  ) : null}
                  <span
                    className={
                      isSelected
                        ? ''
                        : 'opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100'
                    }
                  >
                    <ActionsDropdown
                      actions={dayActions(date, dayKey)}
                      triggerIcon={isSelected ? DotsVerticalGray14Icon : DotsVerticalGray12Icon}
                      iconClassName=""
                      triggerClassName="flex size-5 items-center justify-center rounded hover:bg-[#F1F5F9]"
                    />
                  </span>
                </span>
              </div>

              {items.slice(0, VISIBLE_CHIPS_PER_DAY).map((item) => (
                <EventChip key={item.key} item={item} onClick={onItemClick} />
              ))}

              {hiddenCount > 0 ? (
                <span className="text-start text-[10px] leading-4 font-medium text-[#1E7A52]">
                  {t('monthlyCalendar.board.moreEvents', { count: hiddenCount })}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 text-sm text-[#9D9D9D]">
          {t('common.loading')}
        </div>
      ) : null}
    </div>
  );
}
