import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import CustomImage from '@/shared/components/CustomImage';
import AcademicCalendarList from './components/AcademicCalendarList';
import CalendarOutlineGreenIcon from '@/assets/icons/CalendarOutlineGreen.svg';

export default function AcademicCalendarPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.calendarManagement') },
    { label: t('sidebar.annualCalendar') },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      <div className="mb-4 flex items-center gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#1E7A52] bg-[#ECFDF5]">
          <CustomImage src={CalendarOutlineGreenIcon} alt="" className="h-6 w-6" />
        </div>
        <h1 className="text-2xl leading-8 font-bold tracking-[-0.6px] text-[black]">
          {t('academicCalendar.annualCalendar')}
        </h1>
      </div>

      <AcademicCalendarList />
    </div>
  );
}
