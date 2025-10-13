import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from '@gradex/shared/layout/Breadcrumb';
import Loading from '@gradex/shared/components/Loading';
import SchoolForm from './components/SchoolForm';
import type { SchoolFormData } from './types/school.types';

const EditSchoolPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [schoolData, setSchoolData] = useState<SchoolFormData | null>(null);

  useEffect(() => {
    // TODO: Fetch school data from API
    const fetchSchoolData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock data - replace with actual API call
        const mockData: SchoolFormData = {
          schoolName: 'مدرسة المستقبل',
          academicSystem: 'semester',
          foundationDate: '2020-01-15',
          aboutSchool: 'مدرسة رائدة في التعليم الحديث',
          hasCurrentSystem: true,
          currentSystem: 'نظام إلكتروني متكامل',
          country: 'SA',
          applicationFeatures: {
            attendanceAndDeparture: true,
            remoteBookTracking: false,
            expensesTrackingOnly: false,
            fullExpensesPayment: true,
          },
          bankName: 'البنك الأهلي',
          accountNumber: '1234567890',
          ibanNumber: 'SA1234567890123456789012',
          phoneNumber: '+966501234567',
          email: 'info@school.com',
          website: 'www.school.com',
          contactPerson: 'أحمد محمد',
          region: 'الرياض',
          state: 'الرياض',
          city: 'الرياض',
          street: 'شارع الملك فهد',
          district: 'العليا',
          buildingNumber: '1234',
          postalCode: '12345',
          hasBranches: false,
          hasOtherBranches: false,
          attendanceFeature: true,
          buyBooksFeature: false,
          payCashFeature: true,
          payInstallmentFeature: true,
          facilities: {
            playground: true,
            library: true,
            laboratory: false,
            sportField: true,
            canteen: false,
            busService: true,
          },
        };

        setSchoolData(mockData);
      } catch (error) {
        console.error('Error fetching school data:', error);
        // TODO: Show error message to user
        navigate('/schools');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSchoolData();
    }
  }, [id, navigate]);

  const breadcrumbItems = [
    { label: t('schools.title'), path: '/schools' },
    { label: t('schools.editSchool') },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!schoolData) {
    return (
      <div className="pb-8" dir="rtl">
        <Breadcrumb items={breadcrumbItems} />
        <div className="text-center">
          <p className="text-gray-600">{t('schools.schoolNotFound')}</p>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="pb-8">
      <Breadcrumb items={breadcrumbItems} />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('schools.editSchool')}</h1>
      </div>

      <SchoolForm mode="edit" initialData={schoolData} schoolId={id} />
    </div>
  );
};

export default EditSchoolPage;
