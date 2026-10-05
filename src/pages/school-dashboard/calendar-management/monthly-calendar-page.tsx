import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import CustomImage from '@/shared/components/CustomImage';
import MonthlyCalendar from './components/MonthlyCalendar';
import CalendarOutlineGreenIcon from '@/assets/icons/CalendarOutlineGreen.svg';

export default function MonthlyCalendarPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.calendarManagement') },
    { label: t('sidebar.monthlyCalendar') },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      <div className="mb-4 flex items-center gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#1E7A52] bg-[#ECFDF5]">
          <CustomImage src={CalendarOutlineGreenIcon} alt="" className="h-6 w-6" />
        </div>
        <div className="flex flex-col items-start justify-center gap-1">
          <h1 className="text-2xl leading-[33.6px] font-bold text-[black]">
            {t('monthlyCalendar.title')}
          </h1>
          <p className="text-sm leading-[19.6px] text-[#9D9D9D]">
            {t('monthlyCalendar.board.subtitle')}
          </p>
        </div>
      </div>

      <MonthlyCalendar />
    </div>
  );
}
