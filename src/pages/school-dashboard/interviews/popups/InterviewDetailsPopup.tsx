import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import Modal from '@/shared/popups/Modal';
import CustomImage from '@/shared/components/CustomImage';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import ArrowIcon from '@gradex/assets/icons/Arrow.svg';
import { useAppDispatch } from '@/hooks/useRedux';
import { fetchInterviewById } from '@/redux/features/interviews/interviewsSlice';
import type { Interview as InterviewDetails } from '@/services/api/types/interviews.types';

interface InterviewDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  interview: {
    id: string;
    title: string;
    start: Date;
    end: Date;
    candidateName?: string;
    position?: string;
    supervisor?: string;
  } | null;
}

export default function InterviewDetailsPopup({
  isOpen,
  onClose,
  interview,
}: InterviewDetailsPopupProps) {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const isRTL = i18n.language === 'ar';
  const [fetchedInterview, setFetchedInterview] = useState<InterviewDetails | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !interview?.id) {
      setFetchedInterview(null);
      setFetchError(null);
      return;
    }

    setIsFetching(true);
    setFetchError(null);

    void dispatch(fetchInterviewById(interview.id))
      .unwrap()
      .then((data) => {
        setFetchedInterview(data);
      })
      .catch((error) => {
        const fallback =
          typeof error === 'string' ? error : (error as { message?: string })?.message;
        setFetchError(fallback ?? t('common.error'));
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, [dispatch, interview?.id, isOpen]);

  if (!interview) return null;

  const toDateFromStrings = (dateStr?: string, timeStr?: string) => {
    if (!dateStr || !timeStr) {
      return null;
    }
    const parsed = new Date(`${dateStr}T${timeStr}`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const startDate = useMemo(() => {
    if (fetchedInterview) {
      return toDateFromStrings(fetchedInterview.interviewDate, fetchedInterview.startTime) ?? null;
    }
    return interview.start ?? null;
  }, [fetchedInterview, interview]);

  const endDate = useMemo(() => {
    if (fetchedInterview) {
      return toDateFromStrings(fetchedInterview.interviewDate, fetchedInterview.endTime) ?? null;
    }
    return interview.end ?? null;
  }, [fetchedInterview, interview]);

  const formattedDate = startDate
    ? format(startDate, 'PPP', { locale: isRTL ? ar : undefined })
    : t('common.notAvailable');

  const startTime = startDate
    ? format(startDate, 'p', { locale: isRTL ? ar : undefined })
    : t('common.notAvailable');

  const endTime = endDate
    ? format(endDate, 'p', { locale: isRTL ? ar : undefined })
    : t('common.notAvailable');

  const teacherName = fetchedInterview?.teacherName ?? interview.candidateName;
  const supervisorName = fetchedInterview?.supervisorName ?? interview.supervisor;
  const jobTitle = fetchedInterview?.jobAdvertisementTitle ?? interview.title;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={formattedDate}>
      <div className="space-y-4 py-4">
        {isFetching && (
          <div className="rounded-lg border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">
            {t('common.loading')}...
          </div>
        )}
        {fetchError && !isFetching && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {fetchError}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-900">{t('interviews.title')}</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <CustomImage src={ArrowIcon} alt="arrow" className="h-5 w-5" />
              </div>
            </div>
            <p className="text-gray-700">{jobTitle || t('common.notAvailable')}</p>

            {teacherName && (
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">{t('interviews.teacherName')}</p>:
                <p>{teacherName}</p>
              </div>
            )}

            {supervisorName && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{t('interviews.supervisor')}</p>:
                  <p>{supervisorName}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <CustomImage src={EyeStyledIcon} alt="supervisor" className="h-5 w-5" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">{t('interviews.startTime')}</p>:
                <p>{startTime}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">{t('interviews.endTime')}</p>:
                <p>{endTime}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
