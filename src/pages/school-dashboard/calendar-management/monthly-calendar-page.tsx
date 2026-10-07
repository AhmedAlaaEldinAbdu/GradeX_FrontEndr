import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import { usePageHeader } from '@/hooks/usePageHeader';
import MonthlyCalendar from './components/MonthlyCalendar';
import CalendarOutlineGreenIcon from '@/assets/icons/CalendarOutlineGreen.svg';

export default function MonthlyCalendarPage() {
  const { t } = useTranslation();

  usePageHeader({
    icon: CalendarOutlineGreenIcon,
    title: 'monthlyCalendar.title',
    description: 'monthlyCalendar.board.subtitle',
  });

  const breadcrumbItems = [
    { label: t('sidebar.calendarManagement') },
    { label: t('sidebar.monthlyCalendar') },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      <MonthlyCalendar />
    </div>
  );
}
