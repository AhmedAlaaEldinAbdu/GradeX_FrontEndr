import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@gradex/redux/store/store';
import Breadcrumb from '@gradex/shared/layout/Breadcrumb';
import Loading from '@gradex/shared/components/Loading';
import SchoolForm from './components/SchoolForm';
import type { SchoolFormData } from './types/school.types';
import { transformBackendSchoolToForm } from './utils/school-form.transformer';
import { fetchSchoolById, selectIsLoading } from '@gradex/redux/features/schools';
import { fetchFacilities, selectFacilities } from '@gradex/redux/features/lookups';
import { useToast } from '@/shared/context/ToastContext';

interface EditSchoolPageProps {
  mode?: 'edit' | 'view';
}

const EditSchoolPage: React.FC<EditSchoolPageProps> = ({ mode: propMode }) => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const [schoolData, setSchoolData] = useState<SchoolFormData | null>(null);

  const isLoading = useSelector(selectIsLoading);
  const lookupFacilities = useSelector(selectFacilities);

  const mode = propMode || (location.pathname.includes('/view-school/') ? 'view' : 'edit');

  // Fetch lookup facilities
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

  const breadcrumbItems = [
    { label: t('schools.title'), path: '/schools' },
    { label: mode === 'view' ? t('schools.viewSchool') : t('schools.editSchool') },
  ];

  if (isLoading || !schoolData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="pb-8">
      <Breadcrumb items={breadcrumbItems} />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === 'view' ? schoolData.schoolName : t('schools.editSchool')}
        </h1>
      </div>

      <SchoolForm mode={mode} initialData={schoolData} schoolId={id} />
    </div>
  );
};

export default EditSchoolPage;
