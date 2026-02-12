import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import { useAppSelector } from '@/hooks/useRedux';
import ApplicationDetailsContent from './components/ApplicationDetailsContent';

export default function StudentApplicationDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const { currentApplication } = useAppSelector((state) => state.studentApplications);

  const studentFullName = currentApplication
    ? `${currentApplication.firstName} ${currentApplication.secondName} ${currentApplication.thirdName} ${currentApplication.fourthName}`
    : '';

  const breadcrumbItems = [
    { label: t('studentApplications.title'), path: '/student-applications' },
    { label: studentFullName || t('common.details') },
  ];

  if (!id) return null;

  return (
    <div className="pb-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Main Content Component */}
      <ApplicationDetailsContent applicationId={id} />
    </div>
  );
}
