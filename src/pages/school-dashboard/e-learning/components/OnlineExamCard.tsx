import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Badge from '@/shared/components/Badge';
import CustomImage from '@/shared/components/CustomImage';
import InstituteIcon from '@gradex/assets/icons/Institute.svg';
import GroupLearningIcon from '@gradex/assets/icons/GroupLearning.svg';
import CompletedIcon from '@gradex/assets/icons/Completed.svg';
import CalendarIcon from '@gradex/assets/icons/calendar.svg';
import SparklesIcon from '@gradex/assets/icons/Sparkles.svg';
import IdeaIcon from '@gradex/assets/icons/Idea.svg';
import WritingIcon from '@gradex/assets/icons/Writing.svg';

export type ExamSource = 'ai' | 'questionBank' | 'manual';
export type ExamDifficulty = 'easy' | 'medium' | 'hard';
export type ExamStatus = 'active' | 'scheduled';

export type OnlineExamItem = {
  id: string;
  source: ExamSource;
  difficulty: ExamDifficulty;
  status: ExamStatus;
  title: string;
  stage: string;
  subject: string;
  studentsCount: number;
  completedCount: number;
  date: string;
  time: string;
  progress?: number;
};

const SOURCE_STYLES: Record<ExamSource, { boxClass: string; labelClass: string; icon: string }> = {
  ai: { boxClass: 'bg-[#E5F3FF]', labelClass: 'text-[#117BD7]', icon: SparklesIcon },
  questionBank: { boxClass: 'bg-[#F4E5FF]', labelClass: 'text-[#A353DD]', icon: IdeaIcon },
  manual: { boxClass: 'bg-[#E5FFF4]', labelClass: 'text-[#02804A]', icon: WritingIcon },
};

const DIFFICULTY_VARIANT: Record<ExamDifficulty, 'success' | 'warning' | 'danger'> = {
  easy: 'success',
  medium: 'warning',
  hard: 'danger',
};

// Progress ring geometry (viewBox is 66×66).
const RING_RADIUS = 29;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ExamProgressRing({ value }: { value: number }) {
  const filled = (Math.min(100, Math.max(0, value)) / 100) * RING_CIRCUMFERENCE;

  return (
    <div className="relative h-[66px] w-[66px] shrink-0">
      <svg viewBox="0 0 66 66" className="h-full w-full -rotate-90">
        <circle cx="33" cy="33" r={RING_RADIUS} fill="none" stroke="#DCDBDB" strokeWidth="3.67" />
        <circle
          cx="33"
          cy="33"
          r={RING_RADIUS}
          fill="none"
          stroke="#1A9F58"
          strokeWidth="3.67"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${RING_CIRCUMFERENCE - filled}`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-[#1A9F58]">
        {value}%
      </span>
    </div>
  );
}

function ExamMetaItem({ icon, text }: { icon: string; text: string }) {
  return (
    <span className="flex items-center gap-1.5 text-sm font-normal text-[#646969]">
      <CustomImage src={icon} alt="" className="h-4 w-4" />
      {text}
    </span>
  );
}

export default function OnlineExamCard({ exam }: { exam: OnlineExamItem }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const source = SOURCE_STYLES[exam.source];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/lms/online-exams/${exam.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/lms/online-exams/${exam.id}`);
        }
      }}
      className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[#DDE0E0] p-4 transition-colors hover:bg-gray-50"
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${source.boxClass}`}
        >
          <CustomImage src={source.icon} alt="" className="h-6 w-6" />
        </div>

        <div className="flex flex-col gap-2 text-right">
          <span className={`text-sm font-normal ${source.labelClass}`}>
            {t(`eLearning.exams.sources.${exam.source}`)}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-base font-normal text-[#0E1F1F]">{exam.title}</span>
            <Badge variant={DIFFICULTY_VARIANT[exam.difficulty]} size="sm">
              {t(`eLearning.onlineExams.difficulty.${exam.difficulty}`)}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <ExamMetaItem icon={InstituteIcon} text={exam.stage} />
            <ExamMetaItem
              icon={GroupLearningIcon}
              text={`${exam.studentsCount} ${t('eLearning.units.student')}`}
            />
            <ExamMetaItem
              icon={CompletedIcon}
              text={`${exam.completedCount} ${t('eLearning.onlineExams.completedExam')}`}
            />
            <ExamMetaItem icon={CalendarIcon} text={`${exam.date} - ${exam.time}`} />
          </div>
        </div>
      </div>

      {exam.progress != null ? (
        <ExamProgressRing value={exam.progress} />
      ) : (
        <span className="shrink-0 rounded-3xl bg-[#F2960C]/10 px-4 py-1 text-sm font-medium text-[#A96908]">
          {t('eLearning.onlineExams.status.scheduled')}
        </span>
      )}
    </div>
  );
}
