import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import ClassroomsList from './components/ClassroomsList';
import PlusIcon from '@gradex/assets/icons/Plus.svg';

export default function ClassroomsPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.academicAffairs') },
    { label: t('sidebar.eduStages') },
    { label: t('grades.title') },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader
        title={t('grades.title')}
        actions={[
          {
            label: 'grades.addClassroom',
            to: '/classrooms/add-classroom',
            imgSrc: PlusIcon,
            imgClassName: 'w-10 h-10',
            circle: true,
          },
        ]}
      />

      {/* Main Content */}
      <ClassroomsList />
    </div>
  );
}
