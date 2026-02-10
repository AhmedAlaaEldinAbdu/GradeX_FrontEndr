import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import Button from '@/shared/components/Button';
import CustomImage from '@/shared/components/CustomImage';
import PdfIcon from '@gradex/assets/icons/Pdf.svg';
import DownloadIcon from '@gradex/assets/icons/Download.svg';

// Mock data for the student application details
const mockApplicationData = {
  id: '1',
  studentName: 'اسم الطالب',
  studentImage: 'https://i.pravatar.cc/150?u=1',
  parentInfo: {
    phone: '+20 10 1234 5678',
    email: 'Ahmed@gmail.com',
    country: 'مصر',
    nationality: 'مصري',
    address: 'القاهرة – مدينة نصر – شارع مصطفى النحاس – عمارة 12',
  },
  childInfo: {
    birthDate: '11/4/2022',
    previousSchool: 'مدرسة الرشيد الخاصة',
    gradeLevel: 'Kg 2',
    educationalStage: 'رياض أطفال',
  },
  tuitionFees: {
    paymentMethod: 'نقدي',
    discount: 'الأخوة 15%',
    addedFees: [
      { name: 'الباص المدرسي', price: '33 ريال' },
      { name: 'الباص المدرسي', price: '33 ريال' },
      { name: 'مسبح', price: '33 ريال' },
      { name: 'الباص المدرسي', price: '33 ريال' },
      { name: 'الباص المدرسي', price: '33 ريال' },
      { name: 'مسبح', price: '33 ريال' },
      { name: 'الباص المدرسي', price: '33 ريال' },
      { name: 'الباص المدرسي', price: '33 ريال' },
    ],
    totalOriginal: '5,900',
    totalDiscounted: '5,500',
  },
  attachments: [
    { name: 'هوية ولي الامر', size: '520 KB', type: 'pdf' },
    { name: 'شهادة التطعيم', size: '520 KB', type: 'pdf' },
    { name: 'شهادة التعليمية الاخيرة', size: '520 KB', type: 'pdf' },
  ],
};

export default function StudentApplicationDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  // In a real app, you would fetch data based on ID
  const data = mockApplicationData;

  const breadcrumbItems = [
    { label: t('studentApplications.title'), path: '/student-applications' },
    { label: data.studentName },
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
        <h1 className="text-2xl font-bold text-gray-900">{data.studentName}</h1>
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

      {/* Parent Information Section - with Profile Image inside */}
      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
        {/* Profile Image - centered at top of card */}
        <div className="mb-6 flex justify-center">
          <CustomImage
            src={data.studentImage}
            alt={data.studentName}
            className="h-28 w-28 rounded-full border-4 border-gray-100 object-cover"
          />
        </div>

        {/* Section Title - right aligned */}
        <h2 className="mb-4 border-b border-gray-200 pb-3 text-right text-lg font-bold text-gray-900">
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
                {data.parentInfo.phone}
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
              <span className="text-gray-600">{data.parentInfo.country}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">
                {t('studentApplications.details.nationality')}:
              </span>
              <span className="text-gray-600">{data.parentInfo.nationality}</span>
            </div>
          </div>
          {/* Row 3: Address (full width) */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800">
              {t('studentApplications.details.address')}:
            </span>
            <span className="text-gray-600">{data.parentInfo.address}</span>
          </div>
        </div>
      </div>

      {/* Child Information Section */}
      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 border-b border-gray-200 pb-3 text-right text-lg font-bold text-gray-900">
          {t('studentApplications.details.childInfo')}
        </h2>
        <div className="space-y-4 text-sm">
          {/* Row 1: Birth Date and Previous School */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">
                {t('studentApplications.details.birthDate')}:
              </span>
              <span className="text-gray-600">{data.childInfo.birthDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">
                {t('studentApplications.details.previousSchoolName')}:
              </span>
              <span className="text-gray-600">{data.childInfo.previousSchool}</span>
            </div>
          </div>
          {/* Row 2: Educational Stage and Grade */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">
                {t('studentApplications.details.educationalStage')}:
              </span>
              <span className="text-gray-600">{data.childInfo.educationalStage}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">
                {t('studentApplications.details.gradeLevel')}:
              </span>
              <span className="text-gray-600">{data.childInfo.gradeLevel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tuition Fees Section */}
      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-right text-lg font-bold text-gray-900">
          {t('studentApplications.details.tuitionFees')}
        </h2>

        {/* Payment Method and Discount */}
        <div className="mb-6 space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800">
              {t('studentApplications.details.paymentMethod')}:
            </span>
            <span className="text-gray-600">{data.tuitionFees.paymentMethod}</span>
            <span className="text-sm text-gray-600"> Pay</span>
            <span className="text-sm text-gray-600">Apple Pay</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800">
              {t('studentApplications.details.discount')}:
            </span>
            <span className="text-gray-600">{data.tuitionFees.discount}</span>
          </div>
        </div>

        {/* Added Fees Label */}
        <div className="mb-4 text-right text-sm font-bold text-gray-800">
          {t('studentApplications.details.addedFees')}:
        </div>

        {/* Added Fees Grid - 4 columns, no border/background */}
        <div className="mb-6 grid grid-cols-2 gap-x-4 gap-y-4 md:grid-cols-4">
          {data.tuitionFees.addedFees.map((fee, index) => (
            <div key={index} className="text-center">
              <p className="text-sm font-bold text-gray-800">{fee.name}</p>
              <p className="text-sm text-gray-500">{fee.price}</p>
            </div>
          ))}
        </div>

        {/* Total - label on right (RTL), prices on left */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <span
            className="text-sm font-bold text-green-700"
            style={{ borderRight: '3px solid #16a34a', paddingRight: '8px' }}
          >
            {t('studentApplications.details.totalExpenses')}
          </span>
          <div className="flex items-center gap-3" dir="ltr">
            <span className="text-xl font-bold text-green-600">
              {data.tuitionFees.totalDiscounted}
            </span>
            <span className="text-base text-gray-400 line-through">
              {data.tuitionFees.totalOriginal}
            </span>
          </div>
        </div>
      </div>

      {/* Attachments Section */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-right text-lg font-bold text-gray-900">
          {t('studentApplications.details.attachments')}
        </h2>
        <div className="space-y-3">
          {data.attachments.map((attachment, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-2xl border border-gray-100 p-4"
            >
              {/* File info on the right (RTL start) */}
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-10 items-center justify-center">
                  <CustomImage src={PdfIcon} alt="PDF" className="h-10 w-8" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{attachment.name}</p>
                  <p className="text-xs text-gray-400">{attachment.size}</p>
                </div>
              </div>

              {/* Download button on the left (RTL end) */}
              <button
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-100 text-blue-500 transition-colors hover:bg-gray-50"
                onClick={() => console.log('Download', attachment.name)}
              >
                <CustomImage src={DownloadIcon} alt="Download" className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
