import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/useLanguage';
import CustomImage from '@/shared/components/CustomImage';
import ActionsDropdown, { type Action } from '@/shared/components/ActionsDropdown';
import CalendarAkarGreenIcon from '@/assets/icons/CalendarAkarGreen.svg';
import DotsVerticalGray16Icon from '@/assets/icons/DotsVerticalGray16.svg';
import ClockGray14Icon from '@/assets/icons/ClockGray14.svg';
import LocationGray14Icon from '@/assets/icons/LocationGray14.svg';
import ChevronLeftGreenIcon from '@/assets/icons/ChevronLeftGreen.svg';
import type { MonthlyEventEntity } from '@/services/api/types/monthly-calendar.types';
import {
  TONE_STYLES,
  formatFullDate,
  formatWeekday,
  fromDayKey,
  type MonthlyCalendarItem,
} from './MonthlyCalendarItems';

type MonthlyDayPanelProps = {
  dayKey: string;
  items: MonthlyCalendarItem[];
  onViewItem: (item: MonthlyCalendarItem) => void;
  onEditEvent: (event: MonthlyEventEntity) => void;
  onDeleteEvent: (event: MonthlyEventEntity) => void;
  onViewAll: (dayKey: string) => void;
};

export default function MonthlyDayPanel({
  dayKey,
  items,
  onViewItem,
  onEditEvent,
  onDeleteEvent,
  onViewAll,
}: MonthlyDayPanelProps) {
  const { t, i18n } = useTranslation();
  const { isRTL } = useLanguage();
  const date = fromDayKey(dayKey);

  const cardActions = (item: MonthlyCalendarItem): Action[] => {
    const actions: Action[] = [
      {
        id: `view-${item.key}`,
        label: t('monthlyCalendar.actions.viewDetails'),
        onClick: () => onViewItem(item),
      },
    ];
    const { event } = item;
    if (event) {
      actions.push(
        {
          id: `edit-${item.key}`,
          label: t('monthlyCalendar.actions.editEvent'),
          actionKey: 'edit',
          onClick: () => onEditEvent(event),
        },
        {
          id: `delete-${item.key}`,
          label: t('monthlyCalendar.actions.deleteEvent'),
          actionKey: 'delete',
          color: 'text-red-500 hover:bg-red-50',
          onClick: () => onDeleteEvent(event),
        }
      );
    }
    return actions;
  };

  return (
    <aside className="flex flex-col gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-[17px] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between gap-3 border-b border-[#F1F5F9] pb-[13px]">
        <div className="flex items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#ECFDF5]">
            <CustomImage src={CalendarAkarGreenIcon} alt="" />
          </span>
          <div className="flex flex-col gap-1 text-start">
            <span className="text-xs leading-4 text-[#9D9D9D]">
              {formatWeekday(date, i18n.language)}
            </span>
            <span className="text-sm leading-5 font-bold text-[black]">
              {formatFullDate(date, i18n.language)}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 pb-[4.5px]">
          <span className="text-[10px] leading-[15px] whitespace-nowrap text-[#9D9D9D]">
            {t('monthlyCalendar.board.eventsCount')}
          </span>
          <span className="text-lg leading-[18px] font-bold text-[black]">{items.length}</span>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="py-6 text-center text-xs text-[#9D9D9D]">
          {t('monthlyCalendar.board.noDayEvents')}
        </p>
      ) : (
        items.map((item) => (
          <div
            key={item.key}
            className="flex flex-col gap-2.5 rounded-lg border border-[#E2E8F0] bg-white p-[15px]"
          >
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onViewItem(item)}
                className="flex min-w-0 items-center gap-2 text-start"
              >
                <span className={`size-2.5 shrink-0 rounded-full ${TONE_STYLES[item.tone].dot}`} />
                <span className="truncate text-sm leading-5 font-bold text-[black] hover:underline">
                  {item.title}
                </span>
              </button>
              <ActionsDropdown
                actions={cardActions(item)}
                triggerIcon={DotsVerticalGray16Icon}
                iconClassName=""
                triggerClassName="flex size-6 shrink-0 items-center justify-center rounded hover:bg-[#F1F5F9]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs leading-4 text-[#9D9D9D]">
                <CustomImage src={ClockGray14Icon} alt="" className="shrink-0" />
                <span>{item.timeLabel}</span>
              </div>

              {item.locationLabel ? (
                <div className="flex items-center gap-2 text-xs leading-4 text-[#9D9D9D]">
                  <CustomImage src={LocationGray14Icon} alt="" className="shrink-0" />
                  <span className="truncate">{item.locationLabel}</span>
                </div>
              ) : null}
            </div>
          </div>
        ))
      )}

      <button
        type="button"
        onClick={() => onViewAll(dayKey)}
        className="flex items-center justify-center gap-1 py-1 text-xs leading-4 font-medium text-[#1E7A52] hover:underline"
      >
        {t('monthlyCalendar.board.viewAllDayEvents')}
        <CustomImage
          src={ChevronLeftGreenIcon}
          alt=""
          className={isRTL ? 'shrink-0' : 'shrink-0 rotate-180'}
        />
      </button>
    </aside>
  );
}
