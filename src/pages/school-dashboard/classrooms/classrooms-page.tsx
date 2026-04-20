import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import PlusIcon from '@gradex/assets/icons/Plus.svg';
import ClassroomsList from './components/ClassroomsList';

export default function ClassroomsPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [{ label: t('sidebar.educationalStages') }, { label: t('grades.title') }];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader
        title="grades.title"
        actions={[
          {
            label: 'grades.addGrade',
            to: '/classrooms/add-classroom',
            imgSrc: PlusIcon,
            imgClassName: 'w-[24px] h-[24px]',
          },
        ]}
        hasHeaderControls={true}
      />

      {/* Main Content */}
      <ClassroomsList />
    </div>
  );
}
