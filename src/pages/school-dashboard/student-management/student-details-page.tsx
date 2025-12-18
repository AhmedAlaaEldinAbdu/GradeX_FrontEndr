import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import Tabs, { type TabItem } from '@/shared/components/Tabs';
import PersonalDataTab from '@/pages/school-dashboard/student-management/components/details/PersonalDataTab';
import AttendanceTab from '@/pages/school-dashboard/student-management/components/details/AttendanceTab';
import FeesTab from '@/pages/school-dashboard/student-management/components/details/FeesTab';
import HomeworkTab from '@/pages/school-dashboard/student-management/components/details/HomeworkTab';
import PerformanceTab from '@/pages/school-dashboard/student-management/components/details/PerformanceTab';
import MedicalRecordTab from '@/pages/school-dashboard/student-management/components/details/MedicalRecordTab';
import CustomImage from '@/shared/components/CustomImage';
import DefaultAvatar from '@gradex/assets/images/profile.png';

// Mock data for now
const mockStudentDetails = {
  id: '1',
  fullName: 'أحمد محمود حسن إبراهيم',
  fullNameEn: 'Ahmed Mahmoud Hassan Ibrahim',
  pictureProfilePath: null,
  educationalSystem: 'عالمي',
  educationalSystemEn: 'International',
  className: '1/أ',
  classNameEn: '1/A',
  educationalStage: 'المرحلة الإعدادية',
  educationalStageEn: 'Middle School',
  guardianName: 'محمود حسن إبراهيم',
  guardianNameEn: 'Mahmoud Hassan Ibrahim',
  relationship: 'عم',
  relationshipEn: 'Uncle',
  guardianPhone: '+20 10 1234 5678',
  guardianEmail: 'Ahmed@gmail.com',
  nationality: 'مصري',
  nationalityEn: 'Egyptian',
  address: 'مدينة نصر - شارع مصطفى النحاس - عمارة 12',
  addressEn: 'Nasr City - Mostafa El-Nahhas St. - Building 12',
  schoolName: 'اسم المدرسة السابقة',
  schoolNameEn: 'Previous School Name',
  birthDate: '11/4/2022',
  medicalNotes: 'لا يوجد',
  medicalNotesEn: 'None',
};

export default function StudentDetailsPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const currentLang = i18n.language as 'ar' | 'en';

  const student = mockStudentDetails;

  const breadcrumbItems = [
    { label: t('sidebar.studentManagement') },
    { label: t('students.title'), path: '/students' },
    { label: currentLang === 'ar' ? student.fullName : student.fullNameEn },
  ];

  const tabItems: TabItem[] = [
    {
      id: 'personal-data',
      label: t('students.details.personalData'),
      content: <PersonalDataTab student={student} />,
    },
    {
      id: 'attendance',
      label: t('students.details.attendance'),
      content: <AttendanceTab studentId={id || ''} />,
    },
    {
      id: 'fees',
      label: t('students.details.fees'),
      content: <FeesTab studentId={id || ''} />,
    },
    {
      id: 'homework',
      label: t('students.details.homework'),
      content: <HomeworkTab studentId={id || ''} />,
    },
    {
      id: 'performance',
      label: t('students.details.performance'),
      content: <PerformanceTab studentId={id || ''} />,
    },
    {
      id: 'medical-record',
      label: t('students.details.medicalRecord'),
      content: <MedicalRecordTab studentId={id || ''} />,
    },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Student Header with Photo and Name */}
      <div className="mb-6 flex items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-gray-200">
          <CustomImage
            src={student.pictureProfilePath || DefaultAvatar}
            alt={currentLang === 'ar' ? student.fullName : student.fullNameEn}
            className="h-full w-full object-cover"
          />
        </div>
        <h1 className="text-start text-2xl font-bold text-gray-900">
          {currentLang === 'ar' ? student.fullName : student.fullNameEn}
        </h1>
      </div>

      {/* Tabs */}
      <Tabs
        items={tabItems}
        defaultValue="personal-data"
        searchParamKey="tab"
        className="w-full"
        listClassName="flex gap-1 border-b border-gray-200"
        tabClassName="px-4 py-2 text-sm font-medium transition-colors duration-200 text-gray-500 hover:text-primary-600 focus:outline-none whitespace-nowrap"
        activeTabClassName="border-b-2 border-primary-600 text-primary-600"
        panelClassName="mt-6"
      />
    </div>
  );
}
