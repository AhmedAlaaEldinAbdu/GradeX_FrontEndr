import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

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
import PageHeader from '@/shared/components/PageHeader.tsx';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager.ts';
import { fetchTeacherAssignmentList } from '@/redux/features/teachers/teachersSlice.ts';

const JobApplicationDetailsPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const schoolBranchId = getCurrentSchoolBranchId();
  const [hasAssignment, setHasAssignment] = useState<boolean | null>(null);
  const [firstAssignmentId, setFirstAssignmentId] = useState<string | null>(null);

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

  // Fetch assignment list to check if teacher has placement
  useEffect(() => {
    if (!id || !schoolBranchId) return;
    let cancelled = false;
    dispatch(
      fetchTeacherAssignmentList({
        teacherId: id,
        schoolBranchesId: schoolBranchId,
        page: 1,
      })
    )
      .unwrap()
      .then((data) => {
        if (cancelled) return;
        const assignments = data.data;
        setHasAssignment(assignments.length > 0);
        if (assignments.length > 0) {
          setFirstAssignmentId(assignments[0].id);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHasAssignment(false);
          setFirstAssignmentId(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id, schoolBranchId]);

  const handlePlacementClick = () => {
    if (hasAssignment && firstAssignmentId) {
      navigate(`/teaching-staff/teachers/${id}/edit-placement/${firstAssignmentId}`, {
        state: { comeFrom: 'job-application-details' },
      });
    } else {
      navigate(`/teachers/${id}/add-placement`, { state: { comeFrom: 'job-application-details' } });
    }
  };

  const headerActions = [
    {
      label: hasAssignment ? 'teachers.placement.editTitle' : 'teachers.placement.title',
      onClick: handlePlacementClick,
      variant: 'primary' as const,
    },
  ];
  return (
    <div className="pb-6">
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader
        title={application?.applicantName || ''}
        actions={headerActions}
        hasHeaderControls={true}
      />

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
