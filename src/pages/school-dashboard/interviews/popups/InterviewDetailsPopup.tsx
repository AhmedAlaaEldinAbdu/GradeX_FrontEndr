import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import Modal from '@/shared/popups/Modal';
import CustomImage from '@/shared/components/CustomImage';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import ArrowIcon from '@gradex/assets/icons/Arrow.svg';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  fetchInterviewById,
  setCurrentInterview,
} from '@/redux/features/interviews/interviewsSlice';
import Loading from '@/shared/components/Loading';

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
  const { currentInterview } = useAppSelector((state) => state.interviews);
  const isRTL = i18n.language === 'ar';
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !interview?.id) {
      dispatch(setCurrentInterview(null));
      setFetchError(null);
      setIsFetching(false);
      return;
    }

    setIsFetching(true);
    setFetchError(null);

    dispatch(fetchInterviewById(interview.id))
      .unwrap()
      .catch((error) => {
        const fallback =
          typeof error === 'string' ? error : (error as { message?: string })?.message;
        setFetchError(fallback ?? t('common.error'));
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, [dispatch, interview?.id, isOpen, t]);

  const toDateFromStrings = (dateStr?: string, timeStr?: string) => {
    if (!dateStr || !timeStr) {
      return null;
    }
    const parsed = new Date(`${dateStr}T${timeStr}`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const startDate = useMemo(() => {
    if (currentInterview) {
      return (
        toDateFromStrings(currentInterview.interviewDate, currentInterview.startTime) ??
        interview?.start ??
        null
      );
    }
    return interview?.start ?? null;
  }, [currentInterview, interview]);

  const endDate = useMemo(() => {
    if (currentInterview) {
      return (
        toDateFromStrings(currentInterview.interviewDate, currentInterview.endTime) ??
        interview?.end ??
        null
      );
    }
    return interview?.end ?? null;
  }, [currentInterview, interview]);

  const formattedDate = startDate
    ? format(startDate, 'PPP', { locale: isRTL ? ar : undefined })
    : t('common.notAvailable');

  const startTime = startDate
    ? format(startDate, 'p', { locale: isRTL ? ar : undefined })
    : t('common.notAvailable');

  const endTime = endDate
    ? format(endDate, 'p', { locale: isRTL ? ar : undefined })
    : t('common.notAvailable');

  const teacherName = currentInterview?.teacherName ?? interview?.candidateName;
  const supervisorName = currentInterview?.supervisorName ?? interview?.supervisor;
  const jobTitle = currentInterview?.jobAdvertisementTitle ?? interview?.title;

  if (!interview) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={formattedDate}>
      <div className="space-y-4 py-4">
        {isFetching ? (
          <Loading size="lg" />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">{t('interviews.announcementName')}</p>
                <p className="text-gray-700">{jobTitle}</p>
                <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-100">
                  <CustomImage src={ArrowIcon} alt="arrow" className="h-5 w-5" />
                </div>
              </div>

              {teacherName && (
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{t('interviews.teacherName')}</p>:
                  <p>{teacherName}</p>
                  <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-blue-100">
                    <CustomImage src={EyeStyledIcon} alt="supervisor" className="h-5 w-5" />
                  </div>
                </div>
              )}

              {supervisorName && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{t('interviews.supervisor')}</p>:
                    <p>{supervisorName}</p>
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
        )}
      </div>
    </Modal>
  );
}
