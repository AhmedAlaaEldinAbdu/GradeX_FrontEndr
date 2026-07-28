import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import Loading from '@/shared/components/Loading';
import NotFoundMessage from '@/shared/components/NotFoundMessage';
import PageHeader from '@/shared/components/PageHeader';
import SchoolForm from '@/pages/super-admin-dashboard/schools/components/SchoolForm';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { useLanguage } from '@/hooks/useLanguage';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { logger } from '@/lib/utils/logger';
import { useToast } from '@/shared/context/ToastContext';
import { selectUser } from '@/redux/features/auth/authSelectors';
import { fetchSchoolById } from '@/redux/features/schools';
import { fetchFacilities, selectFacilities } from '@/redux/features/lookups';
import { schoolsApiService } from '@/services/api/schools/schools.service';
import { transformBackendSchoolToForm } from '@/pages/super-admin-dashboard/schools/utils/school-form.transformer';
import type { SchoolFormData } from '@/pages/super-admin-dashboard/schools/types/school.types';

interface SchoolDataPageProps {
  mode?: 'view' | 'edit';
}

const SchoolDataPage = ({ mode = 'view' }: SchoolDataPageProps) => {
  const { t } = useTranslation();
  const { direction } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const user = useAppSelector(selectUser);
  const lookupFacilities = useAppSelector(selectFacilities);
  const [schoolId, setSchoolId] = useState('');
  const [schoolData, setSchoolData] = useState<SchoolFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const branchId = user?.schoolBrancheId ?? getCurrentSchoolBranchId() ?? '';
  const isEditMode = mode === 'edit';

  useEffect(() => {
    dispatch(fetchFacilities());
  }, [dispatch]);

  useEffect(() => {
    let isMounted = true;

    const fetchSchoolData = async () => {
      if (!branchId) {
        setIsLoading(false);
        showToast({
          message: t('common.error'),
          type: 'error',
        });
        return;
      }

      try {
        setIsLoading(true);
        const branchInfo = await schoolsApiService.getSchoolBranchMobile(branchId);
        const resolvedSchoolId = branchInfo?.schoolId ?? '';

        if (!resolvedSchoolId) {
          showToast({
            message: t('schools.schoolNotFound'),
            type: 'error',
          });
          return;
        }

        const school = await dispatch(fetchSchoolById(resolvedSchoolId)).unwrap();
        const formData = transformBackendSchoolToForm(school, lookupFacilities);

        if (isMounted) {
          setSchoolId(resolvedSchoolId);
          setSchoolData(formData);
        }
      } catch (error) {
        logger.error('Failed to load school data', error);
        showToast({
          message: typeof error === 'string' ? error : t('common.error'),
          type: 'error',
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSchoolData();

    return () => {
      isMounted = false;
    };
  }, [branchId, dispatch, lookupFacilities, showToast, t]);

  const breadcrumbItems = [
    { label: 'sidebar.settings' },
    { label: 'sidebar.schoolData' },
    ...(isEditMode ? [{ label: 'schools.editSchool' }] : []),
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" dir={direction}>
        <Loading />
      </div>
    );
  }

  if (!schoolData) {
    return (
      <div className="pb-8" dir={direction}>
        <Breadcrumb items={breadcrumbItems} />
        <PageHeader title="sidebar.schoolData" />
        <NotFoundMessage message="schools.schoolNotFound" />
      </div>
    );
  }

  return (
    <div className="pb-8" dir={direction}>
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader
        title={isEditMode ? 'schools.editSchool' : 'sidebar.schoolData'}
        actions={
          !isEditMode
            ? [
                {
                  label: 'actions.edit',
                  variant: 'primary',
                  size: 'md',
                  onClick: () => navigate('/settings/school-data/edit'),
                },
              ]
            : []
        }
      />

      <SchoolForm
        mode={isEditMode ? 'edit' : 'view'}
        initialData={schoolData}
        schoolId={schoolId}
        returnPath="/settings/school-data"
        showBackButton={false}
      />
    </div>
  );
};

export default SchoolDataPage;
