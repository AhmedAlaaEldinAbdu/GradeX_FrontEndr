import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import TeacherPlacementForm from './components/TeacherPlacementForm';
import TeacherPlacementDetails from './components/TeacherPlacementDetails';

interface LocationState {
  comeFrom?: string;
  requestId?: string;
  teacherId?: string;
}

export default function TeacherPlacementPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const locationState = location.state as LocationState | null;
  const isFromJobAnnouncements = locationState?.comeFrom === 'job-announcements';
  const requestId = locationState?.requestId || searchParams.get('requestId') || undefined;
  const isFromJobApplicationDetails =
    locationState?.comeFrom === 'job-application-details' || !!requestId;
  const teacherId = locationState?.teacherId || id || '';

  const isViewMode = location.pathname.includes('placement-details');

  const breadcrumbItems = isFromJobAnnouncements
    ? [
        { label: t('sidebar.humanResources') },
        { label: t('sidebar.teachingStaff') },
        { label: t('teachers.jobAnnouncements'), path: '/job-announcements' },
        { label: t('teachers.placement.breadcrumb') },
      ]
    : isFromJobApplicationDetails
      ? [
          { label: t('sidebar.humanResources') },
          { label: t('sidebar.adminRequests'), path: '/admin-requests' },
          {
            label: t('adminRequests.jobApplication.detailsTitle'),
            path: requestId ? `/admin-requests/job-application/${requestId}` : '/admin-requests',
          },
          { label: t('teachers.placement.breadcrumb') },
        ]
      : [
          { label: t('sidebar.humanResources') },
          { label: t('sidebar.teachingStaff') },
          { label: t('sidebar.teachers'), path: '/teachers' },
          { label: t('teachers.placement.breadcrumb') },
        ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title={t('teachers.placement.title')} />
      {isViewMode ? (
        <TeacherPlacementDetails teacherId={teacherId} />
      ) : (
        <TeacherPlacementForm
          teacherId={teacherId}
          returnRequestId={isFromJobApplicationDetails ? requestId : undefined}
        />
      )}
    </div>
  );
}
