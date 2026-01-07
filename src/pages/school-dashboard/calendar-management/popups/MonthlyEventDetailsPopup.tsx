import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import Modal from '@/shared/popups/Modal';
import type { MonthlyEventEntity } from '@/services/api/types/monthly-calendar.types';

interface MonthlyEventDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  event: MonthlyEventEntity | null;
}

export default function MonthlyEventDetailsPopup({
  isOpen,
  onClose,
  event,
}: MonthlyEventDetailsPopupProps) {
  const { t, i18n } = useTranslation();

  if (!event) {
    return null;
  }

  const formattedDate = useMemo(() => {
    const parsed = event.day ? new Date(`${event.day}T00:00:00`) : null;
    if (!parsed || Number.isNaN(parsed.getTime())) {
      return event.day;
    }

    return format(parsed, 'PPP', {
      locale: i18n.language === 'ar' ? ar : undefined,
    });
  }, [event.day, i18n.language]);

  const formattedTime = event.isFullDay
    ? t('monthlyCalendar.details.fullDay')
    : `${event.startTime ?? '--:--'} - ${event.endTime ?? '--:--'}`;

  const stageLabels = event.grades.map((stage) =>
    i18n.language === 'ar'
      ? (stage.nameAr ?? stage.nameEn ?? stage.id)
      : (stage.nameEn ?? stage.nameAr ?? stage.id)
  );
  const classroomLabels = event.classRomms.map((classroom) =>
    i18n.language === 'ar'
      ? (classroom.nameAr ?? classroom.nameEn ?? classroom.id)
      : (classroom.nameEn ?? classroom.nameAr ?? classroom.id)
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('monthlyCalendar.details.title')} size="md">
      <div className="space-y-6">
        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-sm text-gray-500">{t('monthlyCalendar.details.eventNameAr')}</p>
          <p className="text-lg font-semibold text-gray-900">{event.nameAr}</p>
        </div>
        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-sm text-gray-500">{t('monthlyCalendar.details.eventNameEn')}</p>
          <p className="text-lg font-semibold text-gray-900">{event.nameEn}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="text-sm text-gray-500">{t('monthlyCalendar.details.date')}</p>
            <p className="text-base font-semibold text-gray-900">{formattedDate}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="text-sm text-gray-500">{t('monthlyCalendar.details.time')}</p>
            <p className="text-base font-semibold text-gray-900">{formattedTime}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600">
              {t('monthlyCalendar.details.stages')}
            </p>
            <div className="flex flex-wrap gap-2">
              {stageLabels.map((stage) => (
                <span
                  key={stage}
                  className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                >
                  {stage}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600">
              {t('monthlyCalendar.details.classrooms')}
            </p>
            <div className="flex flex-wrap gap-2">
              {classroomLabels.map((classroom) => (
                <span
                  key={classroom}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                >
                  {classroom}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
