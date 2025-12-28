import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import Modal from '@/shared/popups/Modal';
import CustomImage from '@/shared/components/CustomImage';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import ArrowIcon from '@gradex/assets/icons/Arrow.svg';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchInterviews } from '@/redux/features/interviews/interviewsSlice';
import type { InterviewFilters } from '@/redux/features/interviews/interviewsSlice';
import type { Interview } from '@/services/api/types/interviews.types';
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
  const isRTL = i18n.language === 'ar';
  const dispatch = useAppDispatch();
  const { popupInterviews, popupIsLoading } = useAppSelector((state) => state.interviews);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

  const safeParseDate = (value?: Date | string | null) => {
    if (!value) return null;
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const normalizeDatePortion = (value?: string) => {
    if (!value) return undefined;
    return value.includes('T') ? (value.split('T')[0] ?? undefined) : value;
  };

  const normalizeTimePortion = (value: string) => {
    if (value.includes('T')) return value;
    return value.length === 5 ? `${value}:00` : value;
  };

  const interviewId = interview?.id ?? null;
  const startDateForFilter = safeParseDate(interview?.start ?? null);
  const dateFilter = startDateForFilter ? format(startDateForFilter, 'yyyy-MM-dd') : undefined;

  useEffect(() => {
    if (!isOpen) {
      setSelectedInterview(null);
      setFetchError(null);
      return;
    }

    if (!interviewId || !dateFilter) {
      if (interviewId) {
        setFetchError(t('common.error'));
      }
      return;
    }

    const filters: InterviewFilters & { Date?: string } = {
      date: dateFilter,
      Date: dateFilter,
    };

    setFetchError(null);
    setSelectedInterview(null);

    dispatch(
      fetchInterviews({
        filters,
        target: 'popup',
      })
    )
      .unwrap()
      .then((response) => {
        const foundInterview = response.data.find((item) => item.id === interviewId) ?? null;
        setSelectedInterview(foundInterview);

        if (!foundInterview) {
          setFetchError(t('interviews.interviewNotFound'));
        }
      })
      .catch((error) => {
        const fallback =
          typeof error === 'string' ? error : (error as { message?: string })?.message;
        setFetchError(fallback ?? t('common.error'));
      });
  }, [dateFilter, dispatch, interviewId, isOpen, t]);

  const toDateFromStrings = (dateStr?: string, timeStr?: string) => {
    if (timeStr?.includes('T')) {
      return safeParseDate(timeStr);
    }

    const normalizedDate = normalizeDatePortion(dateStr);

    if (dateStr?.includes('T') && !timeStr) {
      return safeParseDate(dateStr);
    }

    if (!normalizedDate || !timeStr) {
      return null;
    }

    return safeParseDate(`${normalizedDate}T${normalizeTimePortion(timeStr)}`);
  };

  const resolvedInterview = selectedInterview;

  const startDate = useMemo(() => {
    if (resolvedInterview) {
      return (
        toDateFromStrings(resolvedInterview.interviewDate, resolvedInterview.startTime) ??
        interview?.start ??
        null
      );
    }
    return interview?.start ?? null;
  }, [interview, resolvedInterview]);

  const endDate = useMemo(() => {
    if (resolvedInterview) {
      return (
        toDateFromStrings(resolvedInterview.interviewDate, resolvedInterview.endTime) ??
        interview?.end ??
        null
      );
    }
    return interview?.end ?? null;
  }, [interview, resolvedInterview]);

  const formattedDate = startDate
    ? format(startDate, 'PPP', { locale: isRTL ? ar : undefined })
    : t('common.notAvailable');

  const formatTimeFromString = (time?: string) => {
    if (!time) return t('common.notAvailable');
    const candidate = time.includes('T') ? time : `1970-01-01T${normalizeTimePortion(time)}`;
    const parsed = safeParseDate(candidate);
    if (!parsed) {
      return t('common.notAvailable');
    }
    return format(parsed, 'p', { locale: isRTL ? ar : undefined });
  };

  const isDetailsLoading = popupIsLoading && !resolvedInterview;

  if (!interview) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={formattedDate}>
      <div className="space-y-4 py-4">
        {isDetailsLoading ? (
          <Loading size="lg" />
        ) : (
          <div className="flex flex-col gap-4">
            {popupInterviews.map((detail) => {
              const jobTitle =
                detail.jobAdvertisementName ||
                detail.jobAdvertisementTitle ||
                t('common.notAvailable');

              return (
                <div key={detail.id} className="flex flex-col gap-3 rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">
                      {t('interviews.announcementName')}
                    </p>
                    <p className="text-gray-700">{jobTitle}</p>
                    <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-100">
                      <CustomImage src={ArrowIcon} alt="arrow" className="h-5 w-5" />
                    </div>
                  </div>

                  {detail?.teacherName && (
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{t('interviews.teacherName')}</p>:
                      <p>{detail.teacherName}</p>
                      <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-blue-100">
                        <CustomImage src={EyeStyledIcon} alt="supervisor" className="h-5 w-5" />
                      </div>
                    </div>
                  )}

                  {detail?.supervisorName && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{t('interviews.supervisor')}</p>:
                        <p>{detail.supervisorName}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{t('interviews.startTime')}</p>:
                      <p>{formatTimeFromString(detail.startTime)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{t('interviews.endTime')}</p>:
                      <p>{formatTimeFromString(detail.endTime)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            {fetchError && <p className="text-sm text-red-500">{fetchError}</p>}
          </div>
        )}
      </div>
    </Modal>
  );
}
