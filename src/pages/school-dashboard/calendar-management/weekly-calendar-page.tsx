import { useRef, useState } from 'react';
import WeeklyCalendar, { type WeeklyCalendarHandle } from './components/WeeklyCalendar';
import PageHeader from '@/shared/components/PageHeader';

export default function WeeklyCalendarPage() {
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

  return (
    <div className="space-y-6">
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
