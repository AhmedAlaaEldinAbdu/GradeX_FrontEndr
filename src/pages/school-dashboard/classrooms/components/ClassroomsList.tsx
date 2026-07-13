import { useTranslation } from 'react-i18next';
import CustomImage from '@/shared/components/CustomImage';
import EmptyState from '@/shared/components/EmptyState';
import Card from '@/shared/components/Card';
import MetricCard from '@/shared/components/MetricCard';
import ProgressSummaryCard from '../../../../shared/components/ProgressSummaryCard';
import MathIcon from '@gradex/assets/icons/Math.svg';
import SchoolYellowIcon from '@gradex/assets/icons/SchoolYellow.svg';
import BookBlueIcon from '@gradex/assets/icons/BookBlue.svg';
import StudentGreenIcon from '@gradex/assets/icons/StudentGreen.svg';
import WhitePlusIcon from '@gradex/assets/icons/WhitePlus.svg';
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchGrades } from '@/redux/features/grades/gradesSlice';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import type { GradeDto } from '@/services/api/types/grades.types';

type StageOverview = {
  id: string;
  title: string;
  grades: GradeDto[];
};

export default function ClassroomsList() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';
  const schoolBranchId = getCurrentSchoolBranchId();

  const searchTerm = '';
  const selectedAcademicSystemId = '';
  const selectedGradeId = '';

  // Grades
  const grades = useAppSelector((state) => state.grades.grades);
  const totalStudents = useAppSelector((state) => state.grades.totalStudentsCount);
  const isLoadingGrades = useAppSelector((state) => state.grades.isLoading);
  const isLoading = isLoadingGrades;

  useEffect(() => {
    dispatch(fetchGrades(schoolBranchId ?? ''));
  }, [dispatch, schoolBranchId]);

  const hasActiveFilters = searchTerm || selectedAcademicSystemId || selectedGradeId;

  const stageOverview = useMemo<StageOverview[]>(() => {
    const gradeDrivenStages = (Array.isArray(grades) ? grades : []).reduce<StageOverview[]>(
      (accumulator, grade) => {
        const schoolStageTitle =
          currentLang === 'ar'
            ? grade.lkSchoolStageNameAr || grade.nameAr
            : grade.lkSchoolStageNameEn ||
              grade.lkSchoolStageNameAr ||
              grade.nameEn ||
              grade.nameAr;
        const stageId = grade.lkSchoolStageId || grade.id;
        const existingStage = accumulator.find((stage) => stage.id === stageId);

        if (existingStage) {
          existingStage.grades.push(grade);
          return accumulator;
        }

        accumulator.push({
          id: stageId,
          title: schoolStageTitle,
          grades: [grade],
        });

        return accumulator;
      },
      []
    );

    return gradeDrivenStages;
  }, [currentLang, grades]);

  const hasDisplayableStages = stageOverview.length > 0;
  const shouldShowEmptyState = !isLoading && !hasDisplayableStages && !hasActiveFilters;
  const shouldShowContent = isLoading || hasDisplayableStages || hasActiveFilters;

  const { totalEducationalStages, totalClassrooms } = useMemo(() => {
    const list = Array.isArray(grades) ? grades : [];
    const stageIds = new Set<string>();
    let classrooms = 0;
    for (const grade of list) {
      const stageId = grade.lkSchoolStageId || grade.id;
      if (stageId) stageIds.add(stageId);
      classrooms += grade.classroomCount || 0;
    }
    return {
      totalEducationalStages: stageIds.size,
      totalClassrooms: classrooms,
    };
  }, [grades]);

  const maxStudentCount = useMemo(
    () =>
      (Array.isArray(grades) ? grades : []).reduce(
        (maximum, grade) => Math.max(maximum, grade.classroomCount || 0),
        0
      ),
    [grades]
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          title={t('grades.totalEducationalStages')}
          value={totalEducationalStages}
          icon={
            <CustomImage
              src={SchoolYellowIcon}
              alt={t('grades.totalEducationalStages')}
              className="h-6 w-6"
            />
          }
          iconClassName="bg-yellow-50 text-yellow-600"
        />
        <MetricCard
          title={t('grades.totalClassrooms')}
          value={totalClassrooms}
          icon={
            <CustomImage src={BookBlueIcon} alt={t('grades.totalClassrooms')} className="h-6 w-6" />
          }
          iconClassName="bg-blue-50 text-blue-600"
        />
        <MetricCard
          title={t('grades.totalStudents')}
          value={totalStudents}
          icon={
            <CustomImage
              src={StudentGreenIcon}
              alt={t('grades.totalStudents')}
              className="h-6 w-6"
            />
          }
          iconClassName="bg-green-50 text-green-600"
        />
      </div>

      {shouldShowEmptyState ? (
        <Card className="rounded-3xl border border-[#E6E6E6]" padding="lg">
          <EmptyState imgSrc={MathIcon} description={t('grades.noGradesMessage')} blend={true} />
        </Card>
      ) : shouldShowContent ? (
        <div className="space-y-8">
          {stageOverview.map((stage) => (
            <Card key={stage.id} className="rounded-3xl border border-[#E6E6E6] p-4">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                <div className="text-base font-medium text-black-900">{stage.title}</div>
                {/* <span className="text-sm font-normal text-[#646969]">
                  {stage.grades.reduce(
                    (accumulator, grade) => accumulator + (grade.classroomCount || 0),
                    0
                  )}{' '}
                  {t('grades.studentPlural')}
                </span> */}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {stage.grades.map((grade) => {
                  const gradeName =
                    currentLang === 'ar' ? grade.nameAr : grade.nameEn || grade.nameAr;
                  const classroomCount = grade.classroomCount || 0;
                  // Prefer the API-supplied percentage; fall back to a relative
                  // calculation (this grade's classroom count vs the max in the list)
                  // when the API value isn't present.
                  const progress =
                    typeof grade.classroomPrecentage === 'number'
                      ? Math.max(0, Math.min(100, Math.round(grade.classroomPrecentage)))
                      : maxStudentCount > 0
                        ? Math.round((classroomCount / maxStudentCount) * 100)
                        : 0;
                  const headerAction =
                    classroomCount === 0
                      ? {
                          label: t('grades.addClassroom'),
                          iconSrc: WhitePlusIcon,
                          iconAlt: t('grades.addClassroom'),
                          onClick: () => navigate(`/classrooms/add-classroom?gradeId=${grade.id}`),
                        }
                      : undefined;

                  return (
                    <ProgressSummaryCard
                      key={grade.id}
                      title={gradeName}
                      subtitle={
                        classroomCount
                          ? `${classroomCount} ${t('grades.classroomPlural')}`
                          : t('grades.noClassrooms')
                      }
                      progress={progress}
                      headerAction={headerAction}
                      onClick={() => navigate(`/classrooms/${grade.id}`)}
                    />
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
