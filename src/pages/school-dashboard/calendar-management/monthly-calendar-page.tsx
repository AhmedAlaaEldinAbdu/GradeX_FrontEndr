import { useRef } from 'react';
import PageHeader from '@/shared/components/PageHeader';
import MonthlyCalendar, { type MonthlyCalendarHandle } from './components/MonthlyCalendar';
import PlusIcon from '@gradex/assets/icons/Plus.svg';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import { useTranslation } from 'react-i18next';

export default function MonthlyCalendarPage() {
  const { t } = useTranslation();
  const calendarRef = useRef<MonthlyCalendarHandle>(null);

  const handleAddButtonClick = () => {
    calendarRef.current?.openAddEvent();
  };

  const breadcrumbItems = [
    { label: t('sidebar.academicAffairs') },
    { label: t('sidebar.calendarManagement') },
    { label: t('sidebar.monthlyCalendar') },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader
        title="monthlyCalendar.title"
        actions={[
          {
            label: 'monthlyCalendar.addEventButton',
            onClick: handleAddButtonClick,
            imgSrc: PlusIcon,
            imgClassName: 'w-10 h-10',
            circle: true,
          },
        ]}
        hasHeaderControls={true}
      />

      <MonthlyCalendar ref={calendarRef} />
    </div>
  );
}
