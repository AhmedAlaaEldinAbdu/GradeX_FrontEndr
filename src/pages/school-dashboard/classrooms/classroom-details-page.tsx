import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/useLanguage';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import CustomImage from '@/shared/components/CustomImage';
import Button from '@/shared/components/Button';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchClassrooms } from '@/redux/features/classrooms/classroomsSlice';
import { fetchGradeById } from '@/redux/features/grades/gradesSlice';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import ClassroomManagementOutlineIcon from '@gradex/assets/icons/ClassroomManagementOutline.svg';
import ClassroomsCountBlueIcon from '@gradex/assets/icons/ClassroomsCountBlue.svg';
import StudentsGreenOutlineIcon from '@gradex/assets/icons/StudentsGreenOutline.svg';
import TeacherOrangeOutlineIcon from '@gradex/assets/icons/TeacherOrangeOutline.svg';
import FilePurpleOutlineIcon from '@gradex/assets/icons/FilePurpleOutline.svg';
import ArrowLeftGreenIcon from '@gradex/assets/icons/ArrowLeftGreen.svg';
import ClassroomDetailsContent from './components/ClassroomDetailsContent';

export default function ClassroomDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isRTL } = useLanguage();
  const currentLang = i18n.language as 'ar' | 'en';
  const schoolBranchId = getCurrentSchoolBranchId();
  const locationState = location.state as { comeFrom?: string } | null;
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

  const totalStudents = classrooms.reduce(
    (sum, classroom) => sum + (classroom.foundStudentNumber || 0),
    0
  );
  const totalTeachers = classrooms.reduce(
    (sum, classroom) => sum + (classroom.teacherNumber || 0),
    0
  );
  const totalMaterials = classrooms.reduce(
    (sum, classroom) => sum + (classroom.materialNumber || 0),
    0
  );

  // Listed start -> end: in RTL the first entry renders on the right, matching the design.
  const kpiItems = [
    {
      icon: FilePurpleOutlineIcon,
      value: totalMaterials,
      label: t('grades.materialsCountKpiLabel'),
      iconBgClassName: 'bg-[#faf5ff]',
    },
    {
      icon: TeacherOrangeOutlineIcon,
      value: totalTeachers,
      label: t('grades.teachersCountKpiLabel'),
      iconBgClassName: 'bg-[#fffbeb]',
    },
    {
      icon: StudentsGreenOutlineIcon,
      value: totalStudents,
      label: t('grades.totalStudents'),
      iconBgClassName: 'bg-[#ecfdf5]',
    },
    {
      icon: ClassroomsCountBlueIcon,
      value: classrooms.length,
      label: t('grades.classroomsCountKpiLabel'),
      iconBgClassName: 'bg-[#eff6ff]',
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
        { label: t('sidebar.classrooms'), path: '/classrooms' },
        { label: classroomTitle || t('grades.classroomDetails'), path: `/classrooms/${id}` },
        { label: t('grades.classroomsBreadcrumbLabel') },
      ];

  return (
    <div className="space-y-8">
      {/* Children are ordered start -> end: in RTL the first child renders on the right. */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Breadcrumb items={breadcrumbItems} />
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/classrooms')}
          imgSrc={ArrowLeftGreenIcon}
          imgClassName={`h-4 w-4 ${isRTL && 'rotate-180'}`}
          className="flex-row-reverse rounded-lg! border! border-[#1e7a52]! px-4! py-2! text-xs! text-[#1e7a52]!"
        >
          {t('grades.backToGrades')}
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#1e7a52] bg-[#ecfdf5] p-px">
          <CustomImage src={ClassroomManagementOutlineIcon} alt="" className="h-6 w-6" />
        </div>
        <div className="flex flex-1 flex-col items-start gap-1 text-start">
          <h1 className="text-2xl leading-8 font-bold tracking-[-0.75px] text-[black]">
            {t('grades.classroomsManagementTitle', {
              gradeName: classroomTitle || t('grades.classroomDetails'),
            })}
          </h1>
          <p className="text-sm text-[#9d9d9d]">
            {t('grades.classroomsManagementSubtitle', {
              gradeName: classroomTitle || t('grades.classroomDetails'),
            })}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        {kpiItems.map((item) => (
          <div
            key={item.label}
            className="flex w-full min-w-[220px] flex-1 items-center justify-between rounded-xl border border-[rgba(226,232,240,0.9)] bg-white p-[17px] sm:w-auto"
          >
            <div className="flex flex-col items-start gap-1">
              <span className="text-[26px] leading-[36.4px] font-bold text-[black]">
                {item.value}
              </span>
              <span className="text-sm font-medium text-[#9d9d9d]">{item.label}</span>
            </div>
            <div
              className={`flex size-12 shrink-0 items-center justify-center rounded-xl shadow-[0px_1px_2px_rgba(12,12,13,0.1),0px_1px_2px_rgba(12,12,13,0.05)] ${item.iconBgClassName}`}
            >
              <CustomImage src={item.icon} alt="" className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      <ClassroomDetailsContent currentLang={currentLang} gradeId={id} />
    </div>
  );
}
