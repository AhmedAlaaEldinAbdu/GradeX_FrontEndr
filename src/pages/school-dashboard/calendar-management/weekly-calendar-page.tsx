import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import { usePageHeader } from '@/hooks/usePageHeader';
import WeeklyCalendar from './components/WeeklyCalendar';
import CalendarOutlineGreenIcon from '@/assets/icons/CalendarOutlineGreen.svg';

export default function WeeklyCalendarPage() {
  const { t } = useTranslation();

  usePageHeader({
    icon: CalendarOutlineGreenIcon,
    title: 'weeklyCalendar.title',
    description: 'weeklyCalendar.subtitle',
  });

  const breadcrumbItems = [
    { label: t('sidebar.calendarManagement') },
    { label: t('sidebar.weeklyCalendar') },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      <WeeklyCalendar />
    </div>
  );
}
