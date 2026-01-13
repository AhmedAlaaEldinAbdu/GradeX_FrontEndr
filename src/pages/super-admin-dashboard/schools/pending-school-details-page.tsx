import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from '@gradex/shared/layout/Breadcrumb';
import Loading from '@gradex/shared/components/Loading';
import Button from '@gradex/shared/components/Button';
import SchoolForm from './components/SchoolForm';
import EditRequestPopup from './popups/EditRequestPopup';
import RejectSchoolPopup from './popups/RejectSchoolPopup';
import PopupMessage from '@/shared/popups/PopupMessage';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import type { SchoolFormData } from './types/school.types';

const PendingSchoolDetailsPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [schoolData, setSchoolData] = useState<SchoolFormData | null>(null);
  const [showEditRequestPopup, setShowEditRequestPopup] = useState(false);
  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    // TODO: Fetch pending school data from API
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

        const facilitiesFlags = {
          playground: true,
          library: true,
          laboratory: false,
          sportField: true,
          canteen: false,
          busService: true,
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
          facilities: Object.entries(facilitiesFlags)
            .filter(([, enabled]) => enabled)
            .map(([key]) => key),
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

  const handleAccept = () => {
    // TODO: Implement accept school logic
    console.log('Accept school:', id);
    setShowSuccessPopup(true);
  };

  const handleReject = (reason: string) => {
    // TODO: Implement reject school logic
    console.log('Reject school:', id, 'Reason:', reason);
    setShowRejectPopup(false);
    navigate('/schools');
  };

  const handleEditRequest = (message: string) => {
    // TODO: Implement send edit request logic
    console.log('Edit request for school:', id, 'Message:', message);
    setShowEditRequestPopup(false);
    navigate('/schools');
  };

  const breadcrumbItems = [
    { label: t('schools.title'), path: '/schools' },
    { label: t('schools.pendingSchools') },
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
      {/* Success Popup */}
      <PopupMessage
        open={showSuccessPopup}
        type="success"
        message="schools.schoolAcceptedSuccessfully"
        iconSrc={BigSuccessIcon}
        autoClose={true}
        onClose={() => {
          setShowSuccessPopup(false);
          navigate('/schools');
        }}
      />

      {/* Edit Request Popup */}
      <EditRequestPopup
        open={showEditRequestPopup}
        onCancel={() => setShowEditRequestPopup(false)}
        onConfirm={handleEditRequest}
      />

      {/* Reject Popup */}
      <RejectSchoolPopup
        open={showRejectPopup}
        onCancel={() => setShowRejectPopup(false)}
        onConfirm={handleReject}
      />

      <div className="pb-8">
        <Breadcrumb items={breadcrumbItems} />

        {/* Action Buttons Section */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{schoolData.schoolName}</h1>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowEditRequestPopup(true)}>
              {t('schools.sendEditRequest')}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowRejectPopup(true)}
              className="border-none !bg-red-600 text-white"
            >
              {t('actions.reject')}
            </Button>
            <Button variant="outline" onClick={handleAccept} className="!bg-green-600 text-white">
              {t('actions.accept')}
            </Button>
          </div>
        </div>

        {/* Read-only School Form */}
        <SchoolForm mode="view" initialData={schoolData} schoolId={id} />
      </div>
    </>
  );
};

export default PendingSchoolDetailsPage;
