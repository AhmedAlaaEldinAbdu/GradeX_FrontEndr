import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import { useAppSelector } from '@/hooks/useRedux';
import ClassroomRosterContent from './components/ClassroomRosterContent';
import PageHeader from '@/shared/components/PageHeader';
import { useLocation } from 'react-router-dom';

interface LocationState {
  comeFrom?: string;
}

export default function ClassroomRosterPage() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const currentLang = i18n.language as 'ar' | 'en';
  const currentClassroom = useAppSelector((state) => state.classrooms.currentClassroom);
  const teacherPersonalData = useAppSelector((state) => state.teachers.teacherPersonalData);

  const classroomTitle = currentLang === 'ar' ? currentClassroom?.name : currentClassroom?.nameEn;
  const gradeTitle = currentClassroom?.gradeName;
  const locationState = location.state as LocationState | null;
  const isFromTeacherDetails = locationState?.comeFrom === 'teacher-details';

  const breadcrumbItems = isFromTeacherDetails
    ? [
        { label: t('sidebar.humanResources') },
        { label: t('sidebar.teachingStaff') },
        { label: t('sidebar.staff'), path: '/teaching-staff?tab=teachers' },
        {
          label: teacherPersonalData?.fullName || t('common.loading'),
          path: `/teaching-staff/teachers/${teacherPersonalData?.id}?tab=educational-stages`,
        },
        {
          label: t('teachers.details.educationalStagesAndClassrooms'),
          path: `/teaching-staff/teachers/${teacherPersonalData?.id}?tab=educational-stages`,
        },
        ...(gradeTitle
          ? [
              {
                label: gradeTitle,
                ...(currentClassroom?.gradeId
                  ? { path: `/classrooms/${currentClassroom.gradeId}` }
                  : {}),
              },
            ]
          : []),
        { label: classroomTitle || t('grades.classroomDetails') },
      ]
    : [
        { label: t('sidebar.academicAffairs') },
        { label: t('sidebar.eduStages') },
        { label: t('grades.title'), path: '/classrooms' },
        ...(gradeTitle
          ? [
              {
                label: gradeTitle,
                ...(currentClassroom?.gradeId
                  ? { path: `/classrooms/${currentClassroom.gradeId}` }
                  : {}),
              },
            ]
          : []),
        { label: classroomTitle || t('grades.classroomDetails') },
      ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title={classroomTitle || 'grades.classroomDetails'} hasHeaderControls={true} />
      <ClassroomRosterContent currentLang={currentLang} />
    </div>
  );
}
