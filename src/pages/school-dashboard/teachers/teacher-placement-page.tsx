import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import TeacherPlacementForm from './components/TeacherPlacementForm';
import TeacherPlacementDetails from './components/TeacherPlacementDetails';

export default function TeacherPlacementPage() {
  const { t } = useTranslation();
  const { id, assignmentId } = useParams<{ id?: string; assignmentId?: string }>();

  const isViewMode = !!assignmentId;

  const breadcrumbItems = isViewMode
    ? [
        { label: t('sidebar.teachingStaff') },
        { label: t('sidebar.teachers'), path: '/teachers' },
        { label: t('teachers.placement.breadcrumb') },
      ]
    : [
        { label: t('sidebar.teachingStaff') },
        { label: t('sidebar.teachers'), path: '/teachers' },
        { label: t('teachers.placement.breadcrumb') },
      ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title={t('teachers.placement.title')} />
      {isViewMode ? (
        <TeacherPlacementDetails assignmentId={assignmentId} />
      ) : (
        <TeacherPlacementForm teacherId={id || ''} />
      )}
    </div>
  );
}
