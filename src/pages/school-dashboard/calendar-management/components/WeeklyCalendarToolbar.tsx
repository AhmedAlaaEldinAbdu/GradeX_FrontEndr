import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/useLanguage';
import Button from '@/shared/components/Button';
import CustomImage from '@/shared/components/CustomImage';
import PlusWhite16BoldIcon from '@/assets/icons/PlusWhite16Bold.svg';
import PrinterGreenIcon from '@/assets/icons/PrinterGreen.svg';

import ChevronLeftBlack16Icon from '@/assets/icons/ChevronLeftBlack16.svg';
import ChevronRightBlack16Icon from '@/assets/icons/ChevronRightBlack16.svg';

const NAV_BUTTON =
  'flex items-center justify-center rounded-sm p-1 transition-colors hover:bg-[#E2E8F0]';

type WeeklyCalendarToolbarProps = {
  filters?: ReactNode;
  weekLabel: string;
  isCurrentWeek: boolean;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onCurrentWeek: () => void;
  onPrint: () => void;
  onAddLesson: () => void;
  onCopyWeek: () => void;
  onApplyToPeriod: () => void;
  onRestoreDefaults: () => void;
  isRestoring?: boolean;
};

export default function WeeklyCalendarToolbar({
  filters,
  weekLabel,
  isCurrentWeek,
  onPreviousWeek,
  onNextWeek,
  onCurrentWeek,
  onPrint,
  onAddLesson,
}: WeeklyCalendarToolbarProps) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#E2E8F0] bg-white px-[17px] py-[11px]">
      <div className="flex flex-col items-start gap-[18px]">
        {filters}
        {/* <div className="flex flex-wrap items-center gap-2.5">
          <button type="button" onClick={onCopyWeek} className={GREEN_PILL}>
            <CustomImage src={CopyGreen14Icon} alt="" />
            {t('weeklyCalendar.toolbar.copyWeek')}
          </button>
          <button type="button" onClick={onApplyToPeriod} className={GREEN_PILL}>
            <span className="flex size-3.5 items-center justify-center">
              <CustomImage src={CalendarAkarGreen12Icon} alt="" />
            </span>
            {t('weeklyCalendar.toolbar.applyToPeriod')}
          </button>
          <button
            type="button"
            onClick={onRestoreDefaults}
            disabled={isRestoring}
            className={GREEN_PILL}
          >
            <CustomImage
              src={RestoreGreen14Icon}
              alt=""
              className={isRestoring ? 'animate-spin' : ''}
            />
            {t('weeklyCalendar.toolbar.restoreDefaults')}
          </button>
        </div> */}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onCurrentWeek}
          disabled={isCurrentWeek}
          className={`rounded-lg border px-[11px] py-[5px] text-xs leading-4 font-medium whitespace-nowrap transition-colors ${
            isCurrentWeek
              ? 'cursor-default border-[#E5E7EB] bg-[#F8FAFC] text-[#9D9D9D]'
              : 'border-[#1E7A52] bg-[#ECFDF5] text-[#1E7A52] hover:bg-[#D1FAE5]'
          }`}
        >
          {t('weeklyCalendar.toolbar.currentWeek')}
        </button>

        <div className="flex items-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-[3px]">
          <button
            type="button"
            onClick={onPreviousWeek}
            aria-label={t('weeklyCalendar.toolbar.previousWeek')}
            className={NAV_BUTTON}
          >
            <CustomImage src={isRTL ? ChevronRightBlack16Icon : ChevronLeftBlack16Icon} alt="" />
          </button>
          <span className="min-w-[117px] px-2.5 text-center text-xs leading-4 font-semibold whitespace-nowrap text-[black]">
            {weekLabel}
          </span>
          <button
            type="button"
            onClick={onNextWeek}
            aria-label={t('weeklyCalendar.toolbar.nextWeek')}
            className={NAV_BUTTON}
          >
            <CustomImage src={isRTL ? ChevronLeftBlack16Icon : ChevronRightBlack16Icon} alt="" />
          </button>
        </div>

        <Button
          actionKey="add"
          onClick={onAddLesson}
          icon={<CustomImage src={PlusWhite16BoldIcon} alt="" className="block" />}
          className="h-8 gap-2 rounded-lg! border-0! bg-[#1E7A52]! px-3.5! py-1.5! text-sm! leading-[19.6px] font-semibold! text-white! shadow-none! hover:bg-[#1E7A52]/90!"
        >
          {t('weeklyCalendar.toolbar.addLesson')}
        </Button>

        <button
          type="button"
          onClick={onPrint}
          aria-label={t('weeklyCalendar.toolbar.print')}
          title={t('weeklyCalendar.toolbar.print')}
          className="flex items-center justify-center rounded-lg border border-[#1E7A52] bg-[#ECFDF5] px-[9px] py-[5px] transition-colors hover:bg-[#D1FAE5]"
        >
          <CustomImage src={PrinterGreenIcon} alt="" />
        </button>
      </div>
    </div>
  );
}
