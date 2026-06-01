import { useTranslation } from 'react-i18next';
import EmptyState from '@/shared/components/EmptyState';
import CustomImage from '@/shared/components/CustomImage';
import MathIcon from '@gradex/assets/icons/Math.svg';
import InstituteIcon from '@gradex/assets/icons/Institute.svg';
import GroupLearningIcon from '@gradex/assets/icons/GroupLearning.svg';
import CompletedIcon from '@gradex/assets/icons/Completed.svg';
import CalendarIcon from '@gradex/assets/icons/calendar.svg';
import SparklesIcon from '@gradex/assets/icons/Sparkles.svg';
import WritingIcon from '@gradex/assets/icons/Writing.svg';
import IdeaIcon from '@gradex/assets/icons/Idea.svg';

type ExamSource = 'ai' | 'questionBank' | 'manual';
type ExamStatus = 'scheduled' | 'pending';

type ExamItem = {
  id: string;
  source: ExamSource;
  title: string;
  stage: string;
  studentsCount: number;
  completedCount: number;
  date: string;
  time: string;
  progress?: number;
  status?: ExamStatus;
};

const SOURCE_STYLES: Record<ExamSource, { boxClass: string; labelClass: string; icon: string }> = {
  ai: { boxClass: 'bg-[#E5F3FF]', labelClass: 'text-[#117BD7]', icon: SparklesIcon },
  questionBank: { boxClass: 'bg-[#F4E5FF]', labelClass: 'text-[#A353DD]', icon: IdeaIcon },
  manual: { boxClass: 'bg-[#E5FFF4]', labelClass: 'text-[#02804A]', icon: WritingIcon },
};

// Progress ring geometry (viewBox is 66×66).
const RING_RADIUS = 29;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// Mock data — replaced by the API once the LMS integration is wired up.
const EXAMS: ExamItem[] = [
  {
    id: '1',
    source: 'ai',
    title: 'اختبار الرياضيات - الفصل الثالث',
    stage: 'المرحلة الاعدادية - الصف الأول',
    studentsCount: 45,
    completedCount: 38,
    date: '22/4/2024',
    time: '2:00 مساءا',
    progress: 85,
  },
  {
    id: '2',
    source: 'questionBank',
    title: 'اختبار الرياضيات - الفصل الثالث',
    stage: 'المرحلة الاعدادية - الصف الأول',
    studentsCount: 45,
    completedCount: 38,
    date: '22/4/2024',
    time: '2:00 مساءا',
    progress: 85,
  },
  {
    id: '3',
    source: 'questionBank',
    title: 'اختبار الرياضيات - الفصل الثالث',
    stage: 'المرحلة الاعدادية - الصف الأول',
    studentsCount: 45,
    completedCount: 38,
    date: '22/4/2024',
    time: '2:00 مساءا',
    progress: 85,
  },
  {
    id: '4',
    source: 'manual',
    title: 'اختبار الرياضيات - الفصل الثالث',
    stage: 'المرحلة الاعدادية - الصف الأول',
    studentsCount: 45,
    completedCount: 38,
    date: '22/4/2024',
    time: '2:00 مساءا',
    status: 'scheduled',
  },
];

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

export default function ExamsList() {
  const { t } = useTranslation();

  if (EXAMS.length === 0) {
    return (
      <EmptyState
        icon={
          <CustomImage
            src={MathIcon}
            alt=""
            className="mx-auto h-[150px] w-[150px] mix-blend-luminosity"
          />
        }
        description={t('eLearning.exams.emptyDescription')}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {EXAMS.map((exam) => {
        const source = SOURCE_STYLES[exam.source];

        return (
          <div
            key={exam.id}
            className="flex items-center justify-between gap-4 rounded-2xl border border-[#DDE0E0] p-4"
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
                <span className="text-base font-normal text-[#0E1F1F]">{exam.title}</span>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <ExamMetaItem icon={InstituteIcon} text={exam.stage} />
                  <ExamMetaItem
                    icon={GroupLearningIcon}
                    text={`${exam.studentsCount} ${t('eLearning.units.student')}`}
                  />
                  <ExamMetaItem
                    icon={CompletedIcon}
                    text={`${exam.completedCount} ${t('eLearning.exams.completed')}`}
                  />
                  <ExamMetaItem icon={CalendarIcon} text={`${exam.date} - ${exam.time}`} />
                </div>
              </div>
            </div>

            {exam.progress != null ? (
              <ExamProgressRing value={exam.progress} />
            ) : (
              exam.status && (
                <span className="shrink-0 rounded-3xl bg-[#F2960C]/10 px-4 py-1 text-sm font-medium text-[#A96908]">
                  {t(`eLearning.exams.status.${exam.status}`)}
                </span>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}
