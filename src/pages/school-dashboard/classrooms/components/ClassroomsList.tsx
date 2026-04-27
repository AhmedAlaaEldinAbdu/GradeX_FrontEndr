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
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchGrades } from '@/redux/features/grades/gradesSlice';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import type { Classroom } from '@/services/api/types/classrooms.types';
import type { GradeDto } from '@/services/api/types/grades.types';

type StageOverview = {
  id: string;
  title: string;
  totalStudents: number;
  classrooms: Classroom[];
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

  // Access state directly
  const classrooms = useAppSelector((state) => state.classrooms.classrooms);
  const isLoadingClassrooms = useAppSelector((state) => state.classrooms.isLoading);

  // Grades
  const grades = useAppSelector((state) => state.grades.grades);
  const isLoadingGrades = useAppSelector((state) => state.grades.isLoading);
  const isLoading = isLoadingClassrooms || isLoadingGrades;

  useEffect(() => {
    dispatch(fetchGrades(schoolBranchId ?? ''));
  }, [dispatch, schoolBranchId]);

  const hasActiveFilters = searchTerm || selectedAcademicSystemId || selectedGradeId;

  const gradeMap = useMemo(
    () =>
      (Array.isArray(grades) ? grades : []).reduce<Record<string, GradeDto>>(
        (accumulator, grade) => {
          accumulator[grade.id] = grade;
          return accumulator;
        },
        {}
      ),
    [grades]
  );

  const classroomsByGradeId = useMemo(
    () =>
      classrooms.reduce<Record<string, Classroom[]>>((accumulator, classroom) => {
        if (!accumulator[classroom.gradeId]) {
          accumulator[classroom.gradeId] = [];
        }

        accumulator[classroom.gradeId].push(classroom);
        return accumulator;
      }, {}),
    [classrooms]
  );

  const stageOverview = useMemo<StageOverview[]>(() => {
    const gradeDrivenStages = (Array.isArray(grades) ? grades : []).map((grade) => {
      const stageClassrooms = classroomsByGradeId[grade.id] || [];

      return {
        id: grade.id,
        title: currentLang === 'ar' ? grade.nameAr : grade.nameEn || grade.nameAr,
        totalStudents: stageClassrooms.reduce(
          (accumulator, classroom) => accumulator + (classroom.studentNumber || 0),
          0
        ),
        classrooms: stageClassrooms,
      };
    });

    const orphanStages = Object.entries(classroomsByGradeId)
      .filter(([gradeId]) => !gradeMap[gradeId])
      .map(([gradeId, stageClassrooms]) => ({
        id: gradeId,
        title:
          currentLang === 'ar'
            ? stageClassrooms[0]?.gradeName || '-'
            : stageClassrooms[0]?.gradeName || '-',
        totalStudents: stageClassrooms.reduce(
          (accumulator, classroom) => accumulator + (classroom.studentNumber || 0),
          0
        ),
        classrooms: stageClassrooms,
      }));

    return [...gradeDrivenStages, ...orphanStages];
  }, [classroomsByGradeId, currentLang, gradeMap, grades]);

  const hasDisplayableStages = stageOverview.length > 0;
  const shouldShowEmptyState = !isLoading && !hasDisplayableStages && !hasActiveFilters;
  const shouldShowContent = isLoading || hasDisplayableStages || hasActiveFilters;

  const totalEducationalStages = stageOverview.length;
  const totalClassrooms = classrooms.length;
  const totalStudents = classrooms.reduce(
    (accumulator, classroom) => accumulator + (classroom.studentNumber || 0),
    0
  );

  const maxStudentCount = useMemo(
    () =>
      classrooms.reduce((maximum, classroom) => Math.max(maximum, classroom.studentNumber || 0), 0),
    [classrooms]
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
                <span className="text-sm font-normal text-[#646969]">
                  {stage.totalStudents} {t('grades.studentPlural')}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {stage.classrooms.map((classroom) => {
                  const classroomName = currentLang === 'ar' ? classroom.name : classroom.nameEn;
                  const studentCount = classroom.studentNumber || 0;
                  const progress =
                    maxStudentCount > 0 ? Math.round((studentCount / maxStudentCount) * 100) : 0;

                  return (
                    <ProgressSummaryCard
                      key={classroom.id}
                      title={classroomName}
                      subtitle={`${studentCount} ${t('grades.studentPlural')}`}
                      progress={progress}
                      onClick={() => navigate(`/classrooms/${classroom.id}`)}
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
