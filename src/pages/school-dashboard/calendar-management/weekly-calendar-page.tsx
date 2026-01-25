import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import WeeklyCalendar, { type WeeklyCalendarHandle } from './components/WeeklyCalendar';

export default function WeeklyCalendarPage() {
  const { t, i18n } = useTranslation();
  const calendarRef = useRef<WeeklyCalendarHandle>(null);
  const currentLang = i18n.language;
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
    <div
      className="min-h-screen bg-gray-50/80 p-4 md:p-6"
      dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Header Row: Title on right, Button on left */}
      <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <h1 className="text-xl font-bold text-gray-800 md:text-2xl">{t('weeklyCalendar.title')}</h1>
        <button
          onClick={handleRecoverLessons}
          disabled={isRecovering}
          className={`flex items-center gap-2 rounded-full border-2 border-emerald-600 px-5 py-2 text-sm font-semibold transition-all ${
            isRecovering
              ? 'cursor-not-allowed bg-emerald-50 text-emerald-400'
              : 'bg-white text-emerald-600 hover:bg-emerald-50 active:scale-95'
          }`}
        >
          {isRecovering && (
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {t('weeklyCalendar.recoverLessons')}
        </button>
      </div>

      {/* Calendar Component with all logic */}
      <WeeklyCalendar ref={calendarRef} />
    </div>
  );
}
