import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import Card from '@/shared/components/Card';
import MetricCard from '@/shared/components/MetricCard';
import CustomImage from '@/shared/components/CustomImage';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { fetchSchoolCourseDashboardOverview } from '@/redux/features/school-course/schoolCourseSlice';
import { SchoolCourseDashboardPeriodType } from '@/services/api/types/school-course.types';
import EducationalProgramsCard from './components/EducationalProgramsCard';
import EducationalContentCard, { type ContentFilter } from './components/EducationalContentCard';
import ExamsList from './components/ExamsList';
import TrainingCoursesList from './components/TrainingCoursesList';
import BookBlueIcon from '@gradex/assets/icons/BookBlue.svg';
import CheckMarkIcon from '@gradex/assets/icons/CheckMark.svg';
import StudentYellowIcon from '@gradex/assets/icons/StudentYellow.svg';
import TaskBlueIcon from '@gradex/assets/icons/TaskBlue.svg';

const FILTER_PERIOD_TYPE: Record<ContentFilter, SchoolCourseDashboardPeriodType> = {
  day: SchoolCourseDashboardPeriodType.Daily,
  week: SchoolCourseDashboardPeriodType.Weekly,
  month: SchoolCourseDashboardPeriodType.Monthly,
};

export default function ELearningOverviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const schoolBranchId = getCurrentSchoolBranchId();
  const [contentFilter, setContentFilter] = useState<ContentFilter>('week');
  const dashboardOverview = useAppSelector((state) => state.schoolCourses.dashboardOverview);
  const isFetchingDashboardOverview = useAppSelector(
    (state) => state.schoolCourses.isFetchingDashboardOverview
  );

  useEffect(() => {
    if (!schoolBranchId) return;

    dispatch(
      fetchSchoolCourseDashboardOverview({
        schoolBranchId,
        PeriodType: FILTER_PERIOD_TYPE[contentFilter],
      })
    );
  }, [contentFilter, dispatch, schoolBranchId]);

  const breadcrumbItems = [
    { label: t('sidebar.academicAffairs') },
    { label: t('sidebar.lms') },
    { label: t('eLearning.title') },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader title="eLearning.title" />

      {/* Main Content */}
      <div className="space-y-6">
        {/* Summary metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title={t('eLearning.metrics.activeExams')}
            value={`${dashboardOverview?.activeExamsCount ?? 0} ${t('eLearning.units.exam')}`}
            icon={<CustomImage src={TaskBlueIcon} alt="Active exams" className="h-5 w-5" />}
            iconClassName="bg-[#42ADFF]/10"
          />
          <MetricCard
            title={t('eLearning.courses.title')}
            value={`${dashboardOverview?.completedCoursesCount ?? 0} ${t('eLearning.courses.units.course')}`}
            icon={<CustomImage src={BookBlueIcon} alt="" className="h-5 w-5" />}
            iconClassName="bg-[#117BD7]/10"
          />
          <MetricCard
            title={t('eLearning.metrics.totalStudents')}
            value={`${dashboardOverview?.enrolledStudentsCount ?? 0} ${t('eLearning.units.student')}`}
            icon={<CustomImage src={StudentYellowIcon} alt="Total students" className="h-5 w-5" />}
            iconClassName="bg-[#F6CB3B]/10"
          />
          <MetricCard
            title={t('eLearning.metrics.successRate')}
            value={`${dashboardOverview?.successRate ?? 0}%`}
            icon={<CustomImage src={CheckMarkIcon} alt="Success rate" className="h-5 w-5" />}
            iconClassName="bg-[#1A9F58]/10"
          />
        </div>

        {/* Educational content + programs */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_309px]">
          <EducationalContentCard
            filter={contentFilter}
            isLoading={isFetchingDashboardOverview}
            educationalContent={dashboardOverview?.educationalContent ?? []}
            onFilterChange={setContentFilter}
          />
          <EducationalProgramsCard
            examsCount={dashboardOverview?.totalExamsCount ?? 0}
            coursesCount={dashboardOverview?.totalCoursesCount ?? 0}
          />
        </div>

        {/* Exams */}
        <Card className="rounded-3xl border border-[#DDE0E0]" padding="md">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h3 className="text-base font-medium text-[#3A3A3A]">{t('eLearning.exams.title')}</h3>

            <button
              type="button"
              onClick={() => navigate('/lms/online-exams')}
              className="text-base font-medium text-green-500"
            >
              {t('eLearning.exams.viewAll')}
            </button>
          </div>
          <ExamsList />
        </Card>

        {/* Training courses */}
        <Card className="rounded-3xl border border-[#DDE0E0]" padding="md">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h3 className="text-base font-medium text-[#3A3A3A]">{t('eLearning.courses.title')}</h3>

            <button
              type="button"
              onClick={() => navigate('/lms/courses')}
              className="text-base font-medium text-green-500"
            >
              {t('eLearning.courses.viewAll')}
            </button>
          </div>
          <TrainingCoursesList />
        </Card>
      </div>
    </div>
  );
}
