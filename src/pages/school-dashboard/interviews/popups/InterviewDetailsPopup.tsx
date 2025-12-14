import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import Modal from '@/shared/popups/Modal';
import CustomImage from '@/shared/components/CustomImage';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import ArrowIcon from '@gradex/assets/icons/Arrow.svg';

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

  if (!interview) return null;

  const formattedDate = format(interview.start, 'PPP', {
    locale: isRTL ? ar : undefined,
  });

  const startTime = format(interview.start, 'p', {
    locale: isRTL ? ar : undefined,
  });

  const endTime = format(interview.end, 'p', {
    locale: isRTL ? ar : undefined,
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={formattedDate}>
      <div className="space-y-4 py-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-lg border p-3">
            <div className="flex items-start">{t('interviews.interview')} #1</div>
            {/* Interview Title */}
            <div className="flex items-start gap-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{t('interviews.title')}</p>:
                  <p>{interview.title}</p>
                </div>
                <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-100">
                  <CustomImage src={ArrowIcon} alt="arrow" className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Candidate Name */}
            {interview.candidateName && (
              <div className="flex items-start gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {/* <p className="">{t('interviews.candidateName')}</p>: */}
                    <p className="font-semibold text-gray-900">{t('interviews.teacherName')}</p>:
                    <p>{interview.candidateName}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Supervisor */}
            {interview.candidateName && (
              <div className="flex items-start gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{t('interviews.supervisor')}</p>:
                    <p>{interview.supervisor}</p>
                  </div>
                  <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-blue-100">
                    <CustomImage src={EyeStyledIcon} alt="supervisor" className="h-5 w-5" />
                  </div>
                </div>
              </div>
            )}

            {/* Time Range */}
            <div className="grid grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{t('interviews.startTime')}</p>:
                  <p>{startTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{t('interviews.endTime')}</p>:
                  <p>{endTime}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border p-3">
            <div className="flex items-start">{t('interviews.interview')} #2</div>
            {/* Interview Title */}
            <div className="flex items-start gap-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{t('interviews.title')}</p>:
                  <p>{interview.title}</p>
                </div>
                <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-100">
                  <CustomImage src={ArrowIcon} alt="arrow" className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Candidate Name */}
            {interview.candidateName && (
              <div className="flex items-start gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {/* <p className="">{t('interviews.candidateName')}</p>: */}
                    <p className="font-semibold text-gray-900">{t('interviews.teacherName')}</p>:
                    <p>{interview.candidateName}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Supervisor */}
            {interview.candidateName && (
              <div className="flex items-start gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{t('interviews.supervisor')}</p>:
                    <p>{interview.supervisor}</p>
                  </div>
                  <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-blue-100">
                    <CustomImage src={EyeStyledIcon} alt="supervisor" className="h-5 w-5" />
                  </div>
                </div>
              </div>
            )}

            {/* Time Range */}
            <div className="grid grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{t('interviews.startTime')}</p>:
                  <p>{startTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{t('interviews.endTime')}</p>:
                  <p>{endTime}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
