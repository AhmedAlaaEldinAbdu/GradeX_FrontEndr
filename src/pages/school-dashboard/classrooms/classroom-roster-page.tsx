import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import { useAppSelector } from '@/hooks/useRedux';
import ClassroomRosterContent from './components/ClassroomRosterContent';
import PageHeader from '@/shared/components/PageHeader';

export default function ClassroomRosterPage() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';
  const currentClassroom = useAppSelector((state) => state.classrooms.currentClassroom);

  const classroomTitle = currentLang === 'ar' ? currentClassroom?.name : currentClassroom?.nameEn;

  const breadcrumbItems = [
    { label: t('sidebar.eduStages') },
    { label: t('grades.title'), path: '/classrooms' },
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
