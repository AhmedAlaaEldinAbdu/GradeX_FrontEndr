import { useTranslation } from 'react-i18next';
import Modal from '@/shared/popups/Modal';
import CustomImage from '@/shared/components/CustomImage';
import { getEvaluationStatusBadgeColor } from '@/shared/components/SharedBadges';
import StarFillIcon from '@gradex/assets/icons/StarFill.svg';
import StarOutlineIcon from '@gradex/assets/icons/StarOutline.svg';

export type EvaluationStatus = 'excellent' | 'veryGood' | 'good' | 'unsatisfactory';

export type EvaluationKind = 'academic' | 'behavioral' | 'healthHygiene';

export interface EvaluationSection {
  kind: EvaluationKind;
  rating: number;
  status: EvaluationStatus;
  notes: string;
  notesEn: string;
}

export interface ReportDetails {
  reportName: string;
  reportNameEn: string;
  evaluations: EvaluationSection[];
}

interface ReportDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  report: ReportDetails | null;
}

const TOTAL_STARS = 5;

const kindTitleKey: Record<EvaluationKind, string> = {
  academic: 'performance.academicEvaluation',
  behavioral: 'performance.behavioralEvaluation',
  healthHygiene: 'performance.healthHygieneEvaluation',
};

const statusKey: Record<EvaluationStatus, string> = {
  excellent: 'performance.excellent',
  veryGood: 'performance.veryGood',
  good: 'performance.good',
  unsatisfactory: 'performance.unsatisfactory',
};

export default function ReportDetailsPopup({
  isOpen,
  onClose,
  report,
}: ReportDetailsPopupProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';

  const reportName =
    report && (currentLang === 'ar' ? report.reportName : report.reportNameEn);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={
        reportName
          ? t('performance.reportDetailsTitle', { name: reportName })
          : ''
      }
    >
      <div className="flex flex-col">
        {report?.evaluations.map((evaluation, idx) => (
          <div
            key={evaluation.kind}
            className={`py-5 ${idx > 0 ? 'border-t border-[#EDEDED]' : ''}`}
          >
            <h3 className="mb-4 text-start text-base font-medium text-[#0E1F1F]">
              {t(kindTitleKey[evaluation.kind])}
            </h3>

            <div className="mb-3 flex items-center gap-2 text-sm">
              <span className="font-medium text-[#0E1F1F]">{t('performance.notes')}:</span>
              <span className="text-[#646969]">
                {currentLang === 'ar' ? evaluation.notes : evaluation.notesEn}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-[#0E1F1F]">{t('performance.evaluation')}:</span>
                <span className={getEvaluationStatusBadgeColor(evaluation.status)}>
                  {t(statusKey[evaluation.status])}
                </span>
              </div>
              <StarRating rating={evaluation.rating} />
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function StarRating({ rating }: { rating: number }) {
  const filled = Math.max(0, Math.min(TOTAL_STARS, rating));
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: TOTAL_STARS }).map((_, i) => (
        <CustomImage
          key={i}
          src={i < filled ? StarFillIcon : StarOutlineIcon}
          alt=""
          className="h-5 w-5"
        />
      ))}
    </div>
  );
}
