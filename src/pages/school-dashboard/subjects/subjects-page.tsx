import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import { usePageHeader } from '@/hooks/usePageHeader';
import BookOutlineGreenIcon from '@/assets/icons/BookOutlineGreen.svg';
import SubjectsList from './components/SubjectsList';

export default function SubjectsPage() {
  const { t } = useTranslation();

  usePageHeader({
    icon: BookOutlineGreenIcon,
    title: 'subjects.title',
    description: 'subjects.subtitle',
  });

  const breadcrumbItems = [
    { label: t('sidebar.academicAffairs') },
    { label: t('sidebar.eduStages') },
    { label: t('subjects.title') },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      <SubjectsList />
    </div>
  );
}
