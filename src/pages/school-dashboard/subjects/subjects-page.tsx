import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import PlusIcon from '@gradex/assets/icons/Plus.svg';
import SubjectsList from './components/SubjectsList';

export default function SubjectsPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.academicAffairs') },
    { label: t('sidebar.eduStages') },
    { label: t('subjects.title') },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader
        title="subjects.title"
        actions={[
          {
            label: 'subjects.addSubject',
            to: '/subjects/add',
            imgSrc: PlusIcon,
            imgClassName: 'w-10 h-10',
            circle: true,
          },
        ]}
        hasHeaderControls={true}
      />

      {/* Main Content */}
      <SubjectsList />
    </div>
  );
}
