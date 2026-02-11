import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import Button from '@/shared/components/Button';
import CustomImage from '@/shared/components/CustomImage';
import PdfIcon from '@gradex/assets/icons/Pdf.svg';
import DownloadIcon from '@gradex/assets/icons/Download.svg';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchStudentApplicationById } from '@/redux/features/student-applications/studentApplicationsSlice';
import Loading from '@/shared/components/Loading';
export default function StudentApplicationDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';

  const { currentApplication, currentApplicationLoading, error } = useAppSelector(
    (state) => state.studentApplications
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchStudentApplicationById(id));
    }
  }, [dispatch, id]);

  if (currentApplicationLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error || !currentApplication) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-red-600">{error || t('common.error')}</div>
      </div>
    );
  }

  const data = currentApplication;
  const studentFullName = `${data.firstName} ${data.secondName} ${data.thirdName} ${data.fourthName}`;

  const breadcrumbItems = [
    { label: t('studentApplications.title'), path: '/student-applications' },
    { label: studentFullName },
  ];

  const handleAccept = () => {
    console.log('Accept application', id);
  };

  const handleNotPassed = () => {
    console.log('Not passed', id);
  };

  const handleEditRequest = () => {
    console.log('Send edit request', id);
  };

  const handleScheduleAppointment = () => {
    console.log('Schedule appointment', id);
  };

  return (
    <div dir="rtl" className="pb-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header with Student Name and Actions */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{studentFullName}</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={handleAccept}>
            {t('studentApplications.actions.accept')}
          </Button>
          <Button variant="danger" onClick={handleNotPassed}>
            {t('studentApplications.actions.notPassed')}
          </Button>
          <Button variant="info" onClick={handleEditRequest}>
            {t('studentApplications.actions.sendEditRequest')}
          </Button>
          <Button variant="success" onClick={handleScheduleAppointment}>
            {t('studentApplications.actions.scheduleAppointment')}
          </Button>
        </div>
      </div>

      {/* Single white card container for all sections */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Profile Image - centered at top */}
        <div className="mb-6 flex justify-center">
          <CustomImage
            src={data.studentPhotoPath ? `${baseUrl}/${data.studentPhotoPath}` : ''}
            alt={studentFullName}
            className="h-28 w-28 rounded-full border-4 border-gray-100 object-cover"
          />
        </div>

        {/* Parent Information Section */}
        <div className="mb-8 rounded-2xl border border-gray-200 p-6">
          <h2 className="mb-4 text-right text-lg font-bold text-gray-900">
            {t('studentApplications.details.parentInfo')}
          </h2>

          {/* Parent Info rows - two-column grid */}
          <div className="space-y-4 text-sm">
            {/* Row 1: Phone and Email */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">
                  {t('studentApplications.details.phone')}:
                </span>
                <span className="text-gray-600" dir="ltr">
                  {/* TODO: Add phone number field from API */}-
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">
                  {t('studentApplications.details.email')}:
                </span>
                <span className="text-gray-600">{data.parentInfo.email}</span>
              </div>
            </div>
            {/* Row 2: Country and Nationality */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">
                  {t('studentApplications.details.country')}:
                </span>
                <span className="text-gray-600">{data.parentInfo.lkCountryName || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">
                  {t('studentApplications.details.nationality')}:
                </span>
                <span className="text-gray-600">{/* TODO: Add nationality field from API */}-</span>
              </div>
            </div>
            {/* Row 3: Address (full width) */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">
                {t('studentApplications.details.address')}:
              </span>
              <span className="text-gray-600">
                {[
                  data.parentInfo.cityName,
                  data.parentInfo.districtName,
                  data.parentInfo.streetName,
                  data.parentInfo.buildingNumber,
                ]
                  .filter(Boolean)
                  .join(' – ') || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Child Information Section */}
        <div className="mb-8 rounded-2xl border border-gray-200 p-6">
          <h2 className="mb-4 text-right text-lg font-bold text-gray-900">
            {t('studentApplications.details.childInfo')}
          </h2>
          <div className="space-y-4 text-sm">
            {/* Row 1: Birth Date and Previous School */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">
                  {t('studentApplications.details.birthDate')}:
                </span>
                <span className="text-gray-600">
                  {new Date(data.dateOfBirth).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">
                  {t('studentApplications.details.previousSchoolName')}:
                </span>
                <span className="text-gray-600">
                  {data.hasPreviousSchool ? data.previousSchoolName || '-' : t('common.no')}
                </span>
              </div>
            </div>
            {/* Row 2: Educational Stage and Grade */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">
                  {t('studentApplications.details.educationalStage')}:
                </span>
                <span className="text-gray-600">{data.lkSchoolStageName || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">
                  {t('studentApplications.details.gradeLevel')}:
                </span>
                <span className="text-gray-600">{data.gradeName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tuition Fees Section */}
        <div className="mb-8 rounded-2xl border border-gray-200 p-6">
          <h2 className="mb-4 text-right text-lg font-bold text-gray-900">
            {t('studentApplications.details.tuitionFees')}
          </h2>

          {/* Payment Method and Services */}
          <div className="mb-6 space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">
                {t('studentApplications.details.paymentMethod')}:
              </span>
              <span className="text-gray-600">{data.paymentMethod}</span>
            </div>
            {data.services.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">
                  {t('studentApplications.details.services')}:
                </span>
                <span className="text-gray-600">{data.services.join(', ')}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">
                {t('studentApplications.details.discount')}:
              </span>
              <span className="text-gray-600">
                {data.offers.length > 0 ? data.offers.join(', ') : '-'}
              </span>
            </div>
          </div>

          {/* Paid Services Label */}
          {data.paidServices.length > 0 && (
            <>
              <div className="mb-4 text-right text-sm font-bold text-gray-800">
                {t('studentApplications.details.addedFees')}:
              </div>

              {/* Paid Services Grid - 4 columns */}
              <div className="mb-6 grid grid-cols-2 gap-x-4 gap-y-4 md:grid-cols-4">
                {data.paidServices.map((service) => (
                  <div key={service.id} className="text-center">
                    <p className="text-sm font-bold text-gray-800">{service.name}</p>
                    <p className="text-sm text-gray-500">
                      {service.amount} {t('common.currencyRiyal')}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Total - label on right (RTL), prices on left */}
          <div className="flex items-center justify-between rounded-xl border border-gray-100 p-3">
            <span className="text-sm font-bold text-green-700">
              {t('studentApplications.details.totalExpenses')}
            </span>
            <div className="flex items-center gap-3" dir="ltr">
              <span className="text-xl font-bold text-green-600">
                {data.total.toLocaleString()} {t('common.currencyRiyal')}
              </span>
              {data.tuitionAmount !== data.total && (
                <span className="text-base text-gray-400 line-through">
                  {data.tuitionAmount.toLocaleString()} {t('common.currencyRiyal')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Attachments Section */}
        <div className="rounded-2xl border border-gray-200 p-6">
          <h2 className="mb-4 text-right text-lg font-bold text-gray-900">
            {t('studentApplications.details.attachments')}
          </h2>
          <div className="space-y-3">
            {[
              {
                name: t('studentApplications.details.guardianIdentity'),
                path: data.guardianIdentityPath,
              },
              {
                name: t('studentApplications.details.vaccinationCertificate'),
                path: data.vaccinationCertificatePath,
              },
              {
                name: t('studentApplications.details.lastEducationCertificate'),
                path: data.lastEducationCertificatePath,
              },
              {
                name: t('studentApplications.details.educationalCustody'),
                path: data.educationalCustodyPath,
              },
            ]
              .filter((attachment) => attachment.path)
              .map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-2xl border border-gray-100 p-4"
                >
                  {/* File info on the right (RTL start) */}
                  <div className="flex items-center gap-3">
                    <CustomImage src={PdfIcon} alt="PDF" className="h-8 w-8" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                    </div>
                  </div>

                  {/* Download button on the left (RTL end) */}
                  <a
                    href={`${baseUrl}/${attachment.path}`}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" size="sm">
                      <CustomImage src={DownloadIcon} alt="Download" className="h-5 w-5" />
                    </Button>
                  </a>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
