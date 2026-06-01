import { useTranslation } from 'react-i18next';
import EmptyState from '@/shared/components/EmptyState';
import CustomImage from '@/shared/components/CustomImage';
import CourseCard, { type CourseItem } from './CourseCard';
import CourseMaterialIcon from '@gradex/assets/icons/CourseMaterial.svg';

const COURSES: CourseItem[] = [
  {
    id: '1',
    title: 'ورشة حل مسائل الكسور',
    description: 'ورشة تفاعلية لحل المسائل الصعبة في الكسور',
    instructor: 'أحمد معتز حسن',
    progress: 25,
    studentsCount: 124,
    subject: 'مادة الرياضيات',
    dateRange: '22/2/2024 - 22/3/2024',
    lessons: '6/24',
  },
  {
    id: '2',
    title: 'ورشة حل مسائل الكسور',
    description: 'ورشة تفاعلية لحل المسائل الصعبة في الكسور',
    instructor: 'أحمد معتز حسن',
    progress: 25,
    studentsCount: 124,
    subject: 'مادة الرياضيات',
    dateRange: '22/2/2024 - 22/3/2024',
    lessons: '6/24',
  },
];

export default function TrainingCoursesList() {
  const { t } = useTranslation();

  if (COURSES.length === 0) {
    return (
      <EmptyState
        icon={
          <CustomImage
            src={CourseMaterialIcon}
            alt=""
            className="mx-auto h-[150px] w-[150px] mix-blend-luminosity"
          />
        }
        description={t('eLearning.courses.emptyDescription')}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {COURSES.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
