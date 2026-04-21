import { useRef } from 'react';
import PageHeader from '@/shared/components/PageHeader';
import MonthlyCalendar, { type MonthlyCalendarHandle } from './components/MonthlyCalendar';
import PlusIcon from '@gradex/assets/icons/Plus.svg';

export default function MonthlyCalendarPage() {
  const calendarRef = useRef<MonthlyCalendarHandle>(null);

  const handleAddButtonClick = () => {
    calendarRef.current?.openAddEvent();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="monthlyCalendar.title"
        actions={[
          {
            label: 'monthlyCalendar.addEventButton',
            onClick: handleAddButtonClick,
            imgSrc: PlusIcon,
            imgClassName: 'w-[24px] h-[24px]',
          },
        ]}
        hasHeaderControls={true}
      />

      <MonthlyCalendar ref={calendarRef} />
    </div>
  );
}
