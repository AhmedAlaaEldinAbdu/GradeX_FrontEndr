import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from '@gradex/shared/layout/Breadcrumb';
import Loading from '@gradex/shared/components/Loading';
import SchoolForm from './components/SchoolForm';
import type { SchoolFormData } from './types/school.types';

const RejectedSchoolDetailsPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [schoolData, setSchoolData] = useState<SchoolFormData | null>(null);

  useEffect(() => {
    // TODO: Fetch rejected school data from API
    const fetchSchoolData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock data - replace with actual API call
        const applicationFeatureFlags = {
          attendanceAndDeparture: true,
          remoteBookTracking: false,
          expensesTrackingOnly: false,
          fullExpensesPayment: true,
        };

        const mockData: SchoolFormData = {
          schoolName: 'اسم المدرسة',
          schoolNameAr: 'اسم المدرسة',
          schoolNameEn: 'School Name',
          academicSystemIds: ['government'],
          subSystemIds: [],
          foundationDate: '2020-05-22',
          aboutSchool:
            'بيتم كتابة بيانات مفيدة عن المدرسة وأنشطتها بيتم كتابة بيانات مفيدة عن المدرسة وأنشطتها بيتم كتابة بيانات مفيدة عن المدرسة وأنشطتها',
          hasCurrentSystem: true,
          currentSystem: 'حكومي',
          country: 'SA',
          applicationFeatures: Object.entries(applicationFeatureFlags)
            .filter(([, enabled]) => enabled)
            .map(([key]) => key),
          bankName: 'بنك السعودي المركزي',
          accountNumber: '231',
          ibanNumber: '1222',
          landline: '',
          phoneNumber: '+966501234567',
          email: 'info@school.com',
          website: 'www.school.com',
          contactPerson: 'أحمد محمد',
          addressCountry: 'SA',
          region: 'الرياض',
          state: 'الرياض',
          city: 'الرياض',
          street: 'شارع الملك فهد',
          district: 'العليا',
          buildingNumber: '1234',
          postalCode: '12345',
          hasBranches: false,
          hasOtherBranches: false,
          facilities: ['library', 'laboratory', 'sportField', 'canteen', 'busService'],
          facilityDetails: {},
          hasOtherFacility: false,
          otherFacilityName: '',
          otherFacilityNameAr: '',
          otherFacilityNameEn: '',
        };

        setSchoolData(mockData);
      } catch (error) {
        console.error('Error fetching school data:', error);
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
    { label: t('schools.rejectedSchools') || 'المدارس المرفوضة' },
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
      <div className="pb-8">
        <Breadcrumb items={breadcrumbItems} />
        <div className="text-center">
          <p className="text-gray-600">{t('schools.schoolNotFound')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="pb-8">
        <Breadcrumb items={breadcrumbItems} />

        {/* Page Header with Rejected Badge */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">{schoolData.schoolName}</h1>
          </div>
        </div>

        {/* Read-only School Form */}
        <SchoolForm mode="view" initialData={schoolData} schoolId={id} showRejectedLabel={true} />
      </div>
    </>
  );
};

export default RejectedSchoolDetailsPage;
