import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import EmptyState from '@/shared/components/EmptyState';
import SearchInput from '@/shared/components/SearchInput';
import CustomSelect from '@/shared/components/CustomSelect';
import CustomImage from '@/shared/components/CustomImage';
import OnlineExamCard, { type OnlineExamItem } from './OnlineExamCard';
import MathIcon from '@gradex/assets/icons/Math.svg';
import CancelXGreenIcon from '@gradex/assets/icons/CancelXGreen.svg';

const STAGE = 'المرحلة الاعدادية - الصف الأول';
const SUBJECT = 'الرياضيات';

const EXAMS: OnlineExamItem[] = [
  {
    id: '1',
    source: 'ai',
    difficulty: 'easy',
    status: 'active',
    title: 'اختبار الرياضيات - الفصل الثالث',
    stage: STAGE,
    subject: SUBJECT,
    studentsCount: 45,
    completedCount: 38,
    date: '22/4/2024',
    time: '2:00 مساءا',
    progress: 85,
  },
  {
    id: '2',
    source: 'questionBank',
    difficulty: 'easy',
    status: 'active',
    title: 'اختبار الرياضيات - الفصل الثالث',
    stage: STAGE,
    subject: SUBJECT,
    studentsCount: 45,
    completedCount: 38,
    date: '22/4/2024',
    time: '2:00 مساءا',
    progress: 85,
  },
  {
    id: '3',
    source: 'questionBank',
    difficulty: 'hard',
    status: 'active',
    title: 'اختبار الرياضيات - الفصل الثالث',
    stage: STAGE,
    subject: SUBJECT,
    studentsCount: 45,
    completedCount: 38,
    date: '22/4/2024',
    time: '2:00 مساءا',
    progress: 85,
  },
  {
    id: '4',
    source: 'manual',
    difficulty: 'medium',
    status: 'scheduled',
    title: 'اختبار الرياضيات - الفصل الثالث',
    stage: STAGE,
    subject: SUBJECT,
    studentsCount: 45,
    completedCount: 38,
    date: '22/4/2024',
    time: '2:00 مساءا',
  },
];

export default function OnlineExamsList() {
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [level, setLevel] = useState('');
  const [stage, setStage] = useState('');
  const [subject, setSubject] = useState('');

  const statusOptions = [
    { value: 'active', label: t('eLearning.onlineExams.status.active') },
    { value: 'scheduled', label: t('eLearning.onlineExams.status.scheduled') },
  ];
  const levelOptions = [
    { value: 'easy', label: t('eLearning.onlineExams.difficulty.easy') },
    { value: 'medium', label: t('eLearning.onlineExams.difficulty.medium') },
    { value: 'hard', label: t('eLearning.onlineExams.difficulty.hard') },
  ];
  const stageOptions = [{ value: STAGE, label: STAGE }];
  const subjectOptions = [{ value: SUBJECT, label: SUBJECT }];

  const hasActiveFilters = Boolean(search || status || level || stage || subject);

  const filteredExams = useMemo(
    () =>
      EXAMS.filter(
        (exam) =>
          (!search || exam.title.includes(search)) &&
          (!status || exam.status === status) &&
          (!level || exam.difficulty === level) &&
          (!stage || exam.stage === stage) &&
          (!subject || exam.subject === subject)
      ),
    [search, status, level, stage, subject]
  );

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setLevel('');
    setStage('');
    setSubject('');
  };

  const selectClass = 'min-w-[140px] flex-1';

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-start text-base font-medium text-[#3A3A3A]">
        {t('eLearning.onlineExams.listTitle')}
      </h3>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={t('eLearning.onlineExams.searchPlaceholder')}
          wrapperClassName="min-w-[200px] flex-1"
        />
        <CustomSelect
          value={subject}
          onChange={(v) => setSubject(v as string)}
          options={subjectOptions}
          placeholder={t('eLearning.onlineExams.filters.subject')}
          showSearch={false}
          className={selectClass}
        />
        <CustomSelect
          value={stage}
          onChange={(v) => setStage(v as string)}
          options={stageOptions}
          placeholder={t('eLearning.onlineExams.filters.stage')}
          showSearch={false}
          className={selectClass}
        />
        <CustomSelect
          value={level}
          onChange={(v) => setLevel(v as string)}
          options={levelOptions}
          placeholder={t('eLearning.onlineExams.filters.level')}
          showSearch={false}
          className={selectClass}
        />
        <CustomSelect
          value={status}
          onChange={(v) => setStatus(v as string)}
          options={statusOptions}
          placeholder={t('eLearning.onlineExams.filters.status')}
          showSearch={false}
          className={selectClass}
        />
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex h-[48px] shrink-0 items-center gap-2 rounded-2xl border border-green-500 bg-green-500/10 px-4 text-sm font-normal text-green-500"
          >
            <CustomImage src={CancelXGreenIcon} alt="" className="h-5 w-5" />
            {t('eLearning.onlineExams.clearFilter')}
          </button>
        )}
      </div>

      {/* List */}
      {filteredExams.length === 0 ? (
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
      ) : (
        <div className="flex flex-col gap-4">
          {filteredExams.map((exam) => (
            <OnlineExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      )}
    </div>
  );
}
