import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import WeeklyCalendar, { type WeeklyCalendarHandle } from './components/WeeklyCalendar';

export default function WeeklyCalendarPage() {
  const { t } = useTranslation();
  const calendarRef = useRef<WeeklyCalendarHandle>(null);

  const handleRecoverLessons = () => {
    calendarRef.current?.recoverLessons();
  };

  return (
    <div className="min-h-screen bg-gray-50/80 p-4 md:p-6" dir="rtl">
      {/* Header Row: Title on right, Button on left */}
      <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <h1 className="text-xl font-bold text-gray-800 md:text-2xl">{t('weeklyCalendar.title')}</h1>
        <button
          onClick={handleRecoverLessons}
          className="flex items-center gap-2 rounded-full border-2 border-emerald-600 bg-white px-5 py-2 text-sm font-semibold text-emerald-600 transition-all hover:bg-emerald-50 active:scale-95"
        >
          {t('weeklyCalendar.recoverLessons')}
        </button>
      </div>

      {/* Calendar Component with all logic */}
      <WeeklyCalendar ref={calendarRef} />
    </div>
  );
}
