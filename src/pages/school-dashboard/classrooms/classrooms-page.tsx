import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import { usePageHeader } from '@/hooks/usePageHeader';
import ClassroomsList from './components/ClassroomsList';
import BookOutlineGreenIcon from '@gradex/assets/icons/BookOutlineGreen.svg';

export default function ClassroomsPage() {
  const { t } = useTranslation();

  usePageHeader({
    icon: BookOutlineGreenIcon,
    title: 'grades.title',
    description: 'grades.subtitle',
  });

  const breadcrumbItems = [
    { label: t('sidebar.academicAffairs') },
    { label: t('sidebar.eduStages') },
    { label: t('grades.title') },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Main Content */}
      <ClassroomsList />
    </div>
  );
}
