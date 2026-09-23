import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import Card from '@gradex/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import PageHeader from '@/shared/components/PageHeader';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchClassrooms } from '@/redux/features/classrooms/classroomsSlice';
import { fetchGradeById } from '@/redux/features/grades/gradesSlice';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import WhitePlusIcon from '@gradex/assets/icons/WhitePlus.svg';
import SchoolPurpleIcon from '@gradex/assets/icons/SchoolPurple.svg';
import TeachersNewBlueIcon from '@gradex/assets/icons/TeachersNewBlue.svg';
import FilesTealIcon from '@gradex/assets/icons/FilesTeal.svg';
import BookYellowIcon from '@gradex/assets/icons/BookYellow.svg';
import ClassroomDetailsContent from './components/ClassroomDetailsContent';
import {
  getProgressColorClassName,
  getProgressTextColorClassName,
} from '@/shared/components/ProgressSummaryCard';

type ClassroomWithTeacherName = {
  teacherName?: string | null;
};

interface LocationState {
  comeFrom?: string;
}

export default function ClassroomDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const currentLang = i18n.language as 'ar' | 'en';
  const schoolBranchId = getCurrentSchoolBranchId();
  const locationState = location.state as LocationState | null;
  const isFromTeacherDetails = locationState?.comeFrom === 'teacher-details';

  const classrooms = useAppSelector((state) => state.classrooms.classrooms);
  const grade = useAppSelector((state) => state.grades.currentGrade);
  const teacherPersonalData = useAppSelector((state) => state.teachers.teacherPersonalData);

  useEffect(() => {
    if (!id) {
      return;
    }

    dispatch(
      fetchClassrooms({
        page: 1,
        limit: 10000,
        filters: {
          gradeId: id,
          schoolBranchId,
        },
      })
    );
  }, [dispatch, id, schoolBranchId]);

  useEffect(() => {
    if (!id) {
      return;
    }

    dispatch(fetchGradeById(id));
  }, [dispatch, id]);

  const gradeDetails = classrooms[0];
  const gradeName = grade ? (currentLang === 'ar' ? grade.nameAr : grade.nameEn) : undefined;
  const classroomTitle = gradeName || gradeDetails?.gradeName;
  const responsibleTeacherName = (gradeDetails as ClassroomWithTeacherName | undefined)
    ?.teacherName;
  const MAX_CLASSROOMS = 8;
  const classroomProgress = Math.max(
    0,
    Math.min(100, Math.round((classrooms.length / MAX_CLASSROOMS) * 100))
  );
  const totalTeachers = classrooms.reduce(
    (sum, classroom) => sum + (classroom.teacherNumber || 0),
    0
  );
  const totalMaterials = classrooms.reduce(
    (sum, classroom) => sum + (classroom.materialNumber || 0),
    0
  );
  const totalBooks = classrooms.reduce((sum, classroom) => sum + (classroom.bookNumber || 0), 0);
  const classroomSummaryItems = [
    {
      icon: SchoolPurpleIcon,
      alt: t('classrooms.details.classrooms'),
      value: classrooms.length,
      label: t('classrooms.details.classrooms'),
      iconClassName: 'bg-[#ECE5FF]',
    },
    {
      icon: TeachersNewBlueIcon,
      alt: t('classrooms.details.teacher'),
      value: totalTeachers,
      label: t('classrooms.details.teacher'),
      iconClassName: 'bg-[#DDF1FF]',
    },
    {
      icon: FilesTealIcon,
      alt: t('classrooms.details.studyMaterials'),
      value: totalMaterials,
      label: t('classrooms.details.studyMaterials'),
      iconClassName: 'bg-[#D9F5F7]',
    },
    {
      icon: BookYellowIcon,
      alt: t('classrooms.details.studyBooks'),
      value: totalBooks,
      label: t('classrooms.details.studyBooks'),
      iconClassName: 'bg-[#FFF6D8]',
    },
  ];

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
      ]
    : [
        { label: t('sidebar.academicAffairs') },
        { label: t('sidebar.eduStages') },
        { label: t('grades.title'), path: '/classrooms' },
        { label: classroomTitle || t('grades.classroomDetails') },
      ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <Card className="rounded-3xl border border-[#BDEBD9] bg-[#EDFFF8] p-6">
        <PageHeader
          title={classroomTitle || 'grades.classroomDetails'}
          actions={[
            {
              label: '',
              to: id ? `/classrooms/add-classroom?gradeId=${id}` : '/classrooms/add-classroom',
              className: 'h-10 w-10 rounded-full! p-0!',
              imgSrc: WhitePlusIcon,
              imgClassName: 'h-5 w-5',
            },
          ]}
        />
        <div className="flex flex-col items-start gap-6">
          {responsibleTeacherName ? (
            <div className="text-base font-normal text-[#646969]">
              {t('classrooms.details.responsibleTeacher')}: {responsibleTeacherName}
            </div>
          ) : (
            <div className="p-4"></div>
          )}

          <div className="flex w-full flex-wrap items-center justify-between gap-4">
            {classroomSummaryItems.map((item) => (
              <div key={item.label} className="flex items-center gap-3 text-black-900">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.iconClassName}`}
                >
                  <CustomImage src={item.icon} alt={item.alt} className="h-6 w-6" />
                </div>
                <span className="text-sm font-normal text-[#646969]">
                  {item.value} {item.label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex w-full items-center gap-3">
            <span
              className={`text-base font-medium ${getProgressTextColorClassName(classroomProgress)}`}
            >
              {classroomProgress}%
            </span>
            <div className="h-3 flex-1 rounded-full bg-[#EEEEEE]">
              <div
                className={`h-full rounded-full ${getProgressColorClassName(classroomProgress)}`}
                style={{ width: `${classroomProgress}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      <ClassroomDetailsContent currentLang={currentLang} />
    </div>
  );
}
