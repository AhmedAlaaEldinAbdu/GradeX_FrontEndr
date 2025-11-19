import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@gradex/redux/store/store';
import Breadcrumb from '@gradex/shared/layout/Breadcrumb';
import Loading from '@gradex/shared/components/Loading';
import Button from '@gradex/shared/components/Button';
import SchoolForm from './components/SchoolForm';
import type { SchoolFormData } from './types/school.types';
import { transformBackendSchoolToForm } from './utils/school-form.transformer';
import {
  fetchSchoolById,
  selectIsLoading,
  acceptSchoolApplication,
  rejectSchoolApplication,
  sendSchoolEditRequest,
} from '@gradex/redux/features/schools';
import { fetchFacilities, selectFacilities } from '@gradex/redux/features/lookups';
import { useToast } from '@/shared/context/ToastContext';
import EditRequestPopup from './popups/EditRequestPopup';
import RejectSchoolPopup from './popups/RejectSchoolPopup';
import { SchoolStatusEnum } from '@gradex/services/api/types/school.types';

const ViewSchoolPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const [schoolData, setSchoolData] = useState<SchoolFormData | null>(null);
  const [schoolStatus, setSchoolStatus] = useState<SchoolStatusEnum | null>(null);
  const [showEditRequestPopup, setShowEditRequestPopup] = useState(false);
  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const isLoading = useSelector(selectIsLoading);
  const lookupFacilities = useSelector(selectFacilities);

  const fromPendingSchools = location.state?.fromPendingSchools;
  const fromRejectedSchools = location.state?.fromRejectedSchools;
  const fromRegisteredSchools = location.state?.fromRegisteredSchools;

  useEffect(() => {
    dispatch(fetchFacilities());
  }, [dispatch]);

  useEffect(() => {
    const fetchSchoolData = async () => {
      if (!id) {
        showToast({
          message: t('schools.schoolNotFound'),
          type: 'error',
        });
        navigate('/schools');
        return;
      }

      try {
        const resultAction = await dispatch(fetchSchoolById(id));

        if (fetchSchoolById.fulfilled.match(resultAction)) {
          const formData = transformBackendSchoolToForm(resultAction.payload, lookupFacilities);
          setSchoolData(formData);
          setSchoolStatus(resultAction.payload.schoolStatus);
        } else if (fetchSchoolById.rejected.match(resultAction)) {
          showToast({
            message: (resultAction.payload as string) || t('common.error'),
            type: 'error',
          });
          navigate('/schools');
        }
      } catch (err) {
        console.error('Error fetching school data:', err);
        showToast({
          message: t('common.error'),
          type: 'error',
        });
        navigate('/schools');
      }
    };

    fetchSchoolData();
  }, [id, dispatch, navigate, showToast, t, lookupFacilities]);

  const handleConfirmEditRequest = async (message: string) => {
    if (!message.trim() || !id) {
      showToast({
        message: t('schools.editRequestMessageRequired'),
        type: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      setIsProcessing(true);
      await dispatch(sendSchoolEditRequest({ id, message })).unwrap();
      setShowEditRequestPopup(false);

      showToast({
        message: t('schools.editRequestSentSuccessfully'),
        type: 'success',
        duration: 3000,
      });

      navigate('/schools');
    } catch (error) {
      console.error('Failed to send edit request:', error);
      showToast({
        message: t('common.error'),
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptSchool = async () => {
    if (!id) return;

    try {
      setIsProcessing(true);
      await dispatch(acceptSchoolApplication(id)).unwrap();

      showToast({
        message: t('schools.schoolAcceptedSuccessfully'),
        type: 'success',
        duration: 3000,
      });

      navigate('/schools');
    } catch (error) {
      console.error('Failed to accept school:', error);
      showToast({
        message: t('common.error'),
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectSchool = async (rejectionReason: string) => {
    if (!rejectionReason.trim() || !id) {
      showToast({
        message: t('schools.rejectionReasonRequired'),
        type: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      setIsProcessing(true);
      await dispatch(rejectSchoolApplication({ id, rejectionReason })).unwrap();
      setShowRejectPopup(false);

      showToast({
        message: t('schools.schoolRejectedSuccessfully'),
        type: 'success',
        duration: 3000,
      });

      navigate('/schools');
    } catch (error) {
      console.error('Failed to reject school:', error);
      showToast({
        message: t('common.error'),
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const isPending = schoolStatus === SchoolStatusEnum.PENDING || fromPendingSchools;
  const isRejected =
    schoolStatus === SchoolStatusEnum.REJECTED ||
    schoolStatus === SchoolStatusEnum.DELETED ||
    fromRejectedSchools;
  const isRegistered = schoolStatus === SchoolStatusEnum.ACTIVE || fromRegisteredSchools;

  const breadcrumbItems = [
    { label: t('schools.title'), path: '/schools' },
    ...(isPending ? [{ label: t('schools.pendingSchools'), path: '/schools' }] : []),
    ...(isRejected ? [{ label: t('schools.rejectedSchools'), path: '/schools' }] : []),
    ...(isRegistered ? [{ label: t('schools.registeredSchools'), path: '/schools' }] : []),
    { label: t('schools.viewSchool') },
  ];

  if (isLoading || !schoolData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div dir="rtl" className="pb-8">
      <Breadcrumb items={breadcrumbItems} />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{schoolData.schoolName}</h1>
        </div>

        {(isPending || isRejected) && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => setShowEditRequestPopup(true)}
              disabled={isProcessing}
              imgClassName="h-5 w-5"
            >
              {t('schools.sendEditRequest')}
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleAcceptSchool}
              disabled={isProcessing}
              imgClassName="h-5 w-5"
            >
              {t('actions.accept')}
            </Button>
            {!isRejected && (
              <Button
                variant="danger"
                size="md"
                onClick={() => setShowRejectPopup(true)}
                disabled={isProcessing}
              >
                {t('actions.reject')}
              </Button>
            )}
          </div>
        )}
      </div>

      <SchoolForm
        mode="view"
        initialData={schoolData}
        schoolId={id}
        showRejectedLabel={isRejected}
        showPendingLabel={isPending}
      />

      <EditRequestPopup
        open={showEditRequestPopup}
        onCancel={() => setShowEditRequestPopup(false)}
        onConfirm={handleConfirmEditRequest}
      />
      <RejectSchoolPopup
        open={showRejectPopup}
        onCancel={() => setShowRejectPopup(false)}
        onConfirm={handleRejectSchool}
      />
    </div>
  );
};

export default ViewSchoolPage;
