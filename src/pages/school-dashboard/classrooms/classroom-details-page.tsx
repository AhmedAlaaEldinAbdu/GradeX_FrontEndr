import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import Card from '@gradex/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import PageHeader from '@/shared/components/PageHeader';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchClassroomById } from '@/redux/features/classrooms/classroomsSlice';
import PlusIcon from '@gradex/assets/icons/Plus.svg';
import SchoolPurpleIcon from '@gradex/assets/icons/SchoolPurple.svg';
import TeachersNewBlueIcon from '@gradex/assets/icons/TeachersNewBlue.svg';
import FilesTealIcon from '@gradex/assets/icons/FilesTeal.svg';
import BookYellowIcon from '@gradex/assets/icons/BookYellow.svg';
import ClassroomDetailsContent from './components/ClassroomDetailsContent';

export default function ClassroomDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';
  const userData = localStorage.getItem('userData') || undefined;
  const schoolBranchId = userData ? JSON.parse(userData)?.schoolBranchId : undefined;

  const currentClassroom = useAppSelector((state) => state.classrooms.currentClassroom);

  useEffect(() => {
    if (!id) {
      return;
    }

    dispatch(fetchClassroomById(id));
  }, [dispatch, id]);

  const classroomTitle = currentLang === 'ar' ? currentClassroom?.name : currentClassroom?.nameEn;
  const classroomProgress = Math.max(0, Math.min(100, currentClassroom?.studentNumber || 0));
  const classroomSummaryItems = [
    {
      icon: SchoolPurpleIcon,
      alt: currentLang === 'ar' ? 'صفوف دراسية' : 'Classrooms',
      value: 0,
      label: currentLang === 'ar' ? 'صفوف دراسية' : 'Classrooms',
      iconClassName: 'bg-[#ECE5FF]',
    },
    {
      icon: TeachersNewBlueIcon,
      alt: currentLang === 'ar' ? 'معلم' : 'Teacher',
      value: 0,
      label: currentLang === 'ar' ? 'معلم' : 'Teacher',
      iconClassName: 'bg-[#DDF1FF]',
    },
    {
      icon: FilesTealIcon,
      alt: currentLang === 'ar' ? 'مواد دراسية' : 'Study Materials',
      value: 0,
      label: currentLang === 'ar' ? 'مواد دراسية' : 'Study Materials',
      iconClassName: 'bg-[#D9F5F7]',
    },
    {
      icon: BookYellowIcon,
      alt: currentLang === 'ar' ? 'كتب دراسية' : 'Study Books',
      value: 0,
      label: currentLang === 'ar' ? 'كتب دراسية' : 'Study Books',
      iconClassName: 'bg-[#FFF6D8]',
    },
  ];

  const breadcrumbItems = [
    { label: t('sidebar.educationalStages') },
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
              label: 'grades.addGrade',
              to: '/classrooms/add-classroom',
              imgSrc: PlusIcon,
              imgClassName: 'h-6 w-6',
            },
          ]}
        />
        <div className="flex flex-col items-start gap-6">
          <div className="text-base font-normal text-[#646969]">المعلم المسؤول: الأستاذة منى سليمان</div>

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
            <span className="text-base font-medium text-green-600">{classroomProgress}%</span>
            <div className="h-3 flex-1 rounded-full bg-[#EEEEEE]">
              <div
                className="h-full rounded-full bg-green-500"
                style={{ width: `${classroomProgress}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      <ClassroomDetailsContent currentLang={currentLang} schoolBranchId={schoolBranchId} />
    </div>
  );
}
