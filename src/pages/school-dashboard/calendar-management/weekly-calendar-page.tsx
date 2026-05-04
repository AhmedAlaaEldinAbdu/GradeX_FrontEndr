import { useRef, useState } from 'react';
import WeeklyCalendar, { type WeeklyCalendarHandle } from './components/WeeklyCalendar';
import PageHeader from '@/shared/components/PageHeader';
import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';

export default function WeeklyCalendarPage() {
  const { t } = useTranslation();
  const calendarRef = useRef<WeeklyCalendarHandle>(null);
  const [isRecovering, setIsRecovering] = useState(false);

  const handleRecoverLessons = async () => {
    setIsRecovering(true);
    try {
      await calendarRef.current?.recoverLessons();
    } finally {
      setIsRecovering(false);
    }
  };

  const breadcrumbItems = [
    { label: t('sidebar.academicAffairs') },
    { label: t('sidebar.calendarManagement') },
    { label: t('sidebar.weeklyCalendar') },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader
        title="weeklyCalendar.title"
        actions={[
          {
            label: 'weeklyCalendar.recoverLessons',
            onClick: handleRecoverLessons,
            variant: 'outline',
            loading: isRecovering,
            disabled: isRecovering,
          },
        ]}
        hasHeaderControls={true}
      />

      {/* Calendar Component with all logic */}
      <WeeklyCalendar ref={calendarRef} />
    </div>
  );
}
