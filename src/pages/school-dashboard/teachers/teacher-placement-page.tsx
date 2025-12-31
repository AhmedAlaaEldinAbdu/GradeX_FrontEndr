import { useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import TeacherPlacementForm from './components/TeacherPlacementForm';
import TeacherPlacementDetails from './components/TeacherPlacementDetails';

export default function TeacherPlacementPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const isViewMode = location.pathname.includes('placement-details');

  const breadcrumbItems = [
    { label: t('sidebar.teachingStaff') },
    { label: t('sidebar.teachers'), path: '/teachers' },
    { label: t('teachers.placement.breadcrumb') },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title={t('teachers.placement.title')} />
      {isViewMode ? (
        <TeacherPlacementDetails teacherId={id || ''} />
      ) : (
        <TeacherPlacementForm teacherId={id || ''} />
      )}
    </div>
  );
}
