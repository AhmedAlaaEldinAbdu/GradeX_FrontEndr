import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import Breadcrumb from '@/shared/layout/Breadcrumb';
import Loading from '@/shared/components/Loading';
import NotFoundMessage from '@/shared/components/NotFoundMessage';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  fetchJobApplicationById,
  clearCurrentJobApplication,
} from '@/redux/features/teacher-requests/teacherRequestsSlice';
import JobApplicationDetailsContent from './components/JobApplicationDetailsContent.tsx';
import { mapJobApplication } from './admin-requests.mappers';

const JobApplicationDetailsPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const { currentJobApplication, isDetailsLoading } = useAppSelector(
    (state) => state.teacherRequests
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchJobApplicationById(id));
    }
    return () => {
      dispatch(clearCurrentJobApplication());
    };
  }, [dispatch, id]);

  const application = currentJobApplication ? mapJobApplication(currentJobApplication) : undefined;

  const breadcrumbItems = [
    { label: t('sidebar.humanResources') },
    { label: t('sidebar.adminRequests'), path: '/admin-requests' },
    { label: t('adminRequests.jobApplication.detailsTitle') },
  ];

  return (
    <div className="pb-6">
      <Breadcrumb items={breadcrumbItems} />

      {isDetailsLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loading />
        </div>
      ) : application ? (
        <JobApplicationDetailsContent application={application} />
      ) : (
        <NotFoundMessage message="adminRequests.empty" />
      )}
    </div>
  );
};

export default JobApplicationDetailsPage;
