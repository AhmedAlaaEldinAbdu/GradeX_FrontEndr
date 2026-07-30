import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import ClassroomsList from './components/ClassroomsList';
import PlusIcon from '@gradex/assets/icons/Plus.svg';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NoAccessPermissionModal from '@/shared/popups/NoAccessPermissionModal';
import { FeatureAccess, featurePermissions } from '@/shared/common/get-feature-permission';

export default function ClassroomsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const permission = featurePermissions.educationalStages.stagesClassrooms;
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const breadcrumbItems = [
    { label: t('sidebar.academicAffairs') },
    { label: t('sidebar.eduStages') },
    { label: t('grades.title') },
  ];

  const handleAddClassroom = () => {
    if (permission === FeatureAccess.VIEW) {
      setShowPermissionModal(true);
    } else {
      navigate('/classrooms/add-classroom');
      return;
    }
  };

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
            onClick: handleAddClassroom,
            // to: '/classrooms/add-classroom',
            imgSrc: PlusIcon,
            imgClassName: 'w-10 h-10',
            circle: true,
          },
        ]}
      />

      {/* Main Content */}
      <ClassroomsList />

      {/* No Access Permission Modal */}
      <NoAccessPermissionModal
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
      />
    </div>
  );
}
