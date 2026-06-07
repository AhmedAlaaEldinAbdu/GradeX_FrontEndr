import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '@/shared/components/Card';
import EmptyState from '@/shared/components/EmptyState';
import SearchInput from '@/shared/components/SearchInput';
import CustomSelect from '@/shared/components/CustomSelect';
import CustomImage from '@/shared/components/CustomImage';
import CourseCard, { type CourseItem } from './CourseCard';
import BookOpenBadgeIcon from '@gradex/assets/icons/BookOpenBadge.svg';
import CancelXGreenIcon from '@gradex/assets/icons/CancelXGreen.svg';

const SUBJECT = 'مادة الرياضيات';
const GRADE = 'صف 3/2 ع';

const INITIAL_COURSES: CourseItem[] = [
  {
    id: '1',
    title: 'ورشة حل مسائل الكسور',
    description: 'ورشة تفاعلية لحل المسائل الصعبة في الكسور',
    instructor: 'أحمد معتز حسن',
    status: 'active',
    progress: 25,
    studentsCount: 124,
    subject: SUBJECT,
    dateRange: '22/2/2024 - 22/3/2024',
    lessons: '6/24',
  },
  {
    id: '2',
    title: 'ورشة حل مسائل الكسور',
    description: 'ورشة تفاعلية لحل المسائل الصعبة في الكسور',
    instructor: 'أحمد معتز حسن',
    status: 'completed',
    progress: 100,
    studentsCount: 124,
    subject: SUBJECT,
    dateRange: '22/2/2024 - 22/3/2024',
    lessons: '24/24',
  },
  {
    id: '3',
    title: 'ورشة حل مسائل الكسور',
    description: 'ورشة تفاعلية لحل المسائل الصعبة في الكسور',
    instructor: 'أحمد معتز حسن',
    status: 'ended',
    progress: 100,
    studentsCount: 124,
    subject: SUBJECT,
    dateRange: '22/2/2024 - 22/3/2024',
    lessons: '24/24',
  },
];

export default function TrainingCoursesList() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [courses, setCourses] = useState<CourseItem[]>(INITIAL_COURSES);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [status, setStatus] = useState('');

  const subjectOptions = [{ value: SUBJECT, label: SUBJECT }];
  const gradeOptions = [{ value: GRADE, label: GRADE }];
  const statusOptions = [
    { value: 'active', label: t('eLearning.courses.status.active') },
    { value: 'completed', label: t('eLearning.courses.status.completed') },
    { value: 'ended', label: t('eLearning.courses.status.ended') },
  ];

  const hasActiveFilters = Boolean(search || subject || grade || status);

  const filteredCourses = useMemo(
    () =>
      courses.filter(
        (course) =>
          (!search || course.title.includes(search)) &&
          (!subject || course.subject === subject) &&
          (!status || course.status === status)
      ),
    [courses, search, subject, status]
  );

  const clearFilters = () => {
    setSearch('');
    setSubject('');
    setGrade('');
    setStatus('');
  };

  const handleDelete = (course: CourseItem) =>
    setCourses((prev) => prev.filter((c) => c.id !== course.id));

  const handleEdit = (course: CourseItem) => navigate(`/lms/courses/${course.id}/edit`);

  const selectClass = 'min-w-[160px]';

  return (
    <div className="flex flex-col gap-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-start gap-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={t('eLearning.courses.searchPlaceholder')}
          wrapperClassName="min-w-[220px]"
        />
        <CustomSelect
          value={subject}
          onChange={(v) => setSubject(v as string)}
          options={subjectOptions}
          placeholder={t('eLearning.courses.filters.subject')}
          showSearch={false}
          className={selectClass}
        />
        <CustomSelect
          value={grade}
          onChange={(v) => setGrade(v as string)}
          options={gradeOptions}
          placeholder={t('eLearning.courses.filters.grades')}
          showSearch={false}
          className={selectClass}
        />
        <CustomSelect
          value={status}
          onChange={(v) => setStatus(v as string)}
          options={statusOptions}
          placeholder={t('eLearning.courses.filters.status')}
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
      {filteredCourses.length === 0 ? (
        <Card className="rounded-3xl border border-[#E6E6E6]" padding="md">
          <EmptyState
            icon={
              <CustomImage
                src={BookOpenBadgeIcon}
                alt=""
                className="mx-auto h-[150px] w-[150px] mix-blend-luminosity"
              />
            }
            description={t('eLearning.courses.emptyDescription')}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
