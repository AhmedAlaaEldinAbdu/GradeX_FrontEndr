import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import AcademicCalendarList from './components/AcademicCalendarList';
import CalendarOutlineGreenIcon from '@/assets/icons/CalendarOutlineGreen.svg';
import { usePageHeader } from '@/hooks/usePageHeader';

export default function AcademicCalendarPage() {
  const { t } = useTranslation();

  usePageHeader({
    icon: CalendarOutlineGreenIcon,
    title: 'academicCalendar.annualCalendar',
  });

  const breadcrumbItems = [
    { label: t('sidebar.calendarManagement') },
    { label: t('sidebar.annualCalendar') },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      <AcademicCalendarList />
    </div>
  );
}
