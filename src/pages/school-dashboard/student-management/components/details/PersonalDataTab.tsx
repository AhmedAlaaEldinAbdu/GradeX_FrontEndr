import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DownloadIcon from '@gradex/assets/icons/Download.svg';
import PdfIcon from '@gradex/assets/icons/Pdf.svg';
import CustomImage from '@/shared/components/CustomImage';
import Button from '@/shared/components/Button';
import DefaultAvatar from '@gradex/assets/images/profile.png';
import ReassignStudentPopup from '@/pages/school-dashboard/student-management/popups/ReassignStudentPopup';
import { studentsApiService } from '@/services/api/students/students.service';
import { useToast } from '@/shared/context/ToastContext';
import Card from '@/shared/components/Card';

interface PersonalDataTabProps {
  student: {
    id: string;
    fullName: string;
    fullNameEn: string;
    pictureProfilePath: string | null;
    systemType?: string;
    systemTypeEn?: string;
    educationalSystem: string;
    educationalSystemEn: string;
    className: string;
    classNameEn: string;
    educationalStage: string;
    educationalStageEn: string;
    guardianName: string;
    guardianNameEn: string;
    relationship: string;
    relationshipEn: string;
    guardianPhone: string;
    guardianEmail: string;
    nationality: string;
    nationalityEn: string;
    address: string;
    addressEn: string;
    schoolName: string;
    schoolNameEn: string;
    birthDate: string;
  };
}

export default function PersonalDataTab({ student }: PersonalDataTabProps) {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const currentLang = i18n.language as 'ar' | 'en';

  const [showReassignPopup, setShowReassignPopup] = useState(false);
  const [isReassigning, setIsReassigning] = useState(false);

  const handleReassignConfirm = async (classroomId: string) => {
    setIsReassigning(true);
    try {
      await studentsApiService.assignStudentToClassroom(student.id, classroomId);
      showToast({
        message: 'studentManagement.studentReassignedSuccessfully',
        type: 'success',
      });
      setShowReassignPopup(false);
    } catch {
      showToast({ message: 'common.errorOccurred', type: 'error' });
    } finally {
      setIsReassigning(false);
    }
  };

  const attachments = [
    { id: '1', name: 'هوية ولي الامر', nameEn: 'Guardian ID', size: '520 KB' },
    { id: '2', name: 'الولايه التعليمية', nameEn: 'Educational Guardianship', size: '520 KB' },
    { id: '3', name: 'شهادة التطعيم', nameEn: 'Vaccination Certificate', size: '520 KB' },
    {
      id: '4',
      name: 'شهادة التعليمية الاخير',
      nameEn: 'Last Educational Certificate',
      size: '520 KB',
    },
    { id: '5', name: 'العقود', nameEn: 'Contracts', size: '520 KB' },
  ];

  const SectionCard = ({
    title,
    children,
    action,
  }: {
    title: string;
    children: React.ReactNode;
    action?: React.ReactNode;
  }) => (
    <div className="mb-4 rounded-2xl border border-[#EDEDED] bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base font-medium text-[#0E1F1F]">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );

  const DataRow = ({
    label,
    value,
    fullWidth = false,
  }: {
    label: string;
    value: string;
    fullWidth?: boolean;
  }) => (
    <div
      className={`flex items-center gap-2 text-start text-sm ${fullWidth ? 'md:col-span-2' : ''}`}
    >
      <span className="font-medium text-[#0E1F1F]">{label}:</span>
      <span className="font-normal text-[#646969]">{value || '-'}</span>
    </div>
  );

  return (
    <Card>
      <div className="mb-4 rounded-2xl border border-[#E8F2EC] bg-[#F1FAF6] p-5">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-white bg-white shadow-sm">
            <CustomImage
              src={student.pictureProfilePath || DefaultAvatar}
              fallbackSrc={DefaultAvatar}
              alt={currentLang === 'ar' ? student.fullName : student.fullNameEn}
              className="h-full w-full object-cover"
            />
          </div>
          <p className="text-base font-medium text-[#0E1F1F]">
            {currentLang === 'ar' ? student.fullName : student.fullNameEn}
          </p>
        </div>
      </div>

      <SectionCard
        title={t('students.details.housingData')}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReassignPopup(true)}
            className="rounded-xl px-4"
          >
            {t('students.details.reAssign')}
          </Button>
        }
      >
        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
          <DataRow
            label={t('students.details.systemType')}
            value={
              currentLang === 'ar'
                ? student.systemType || ''
                : student.systemTypeEn || student.systemType || ''
            }
          />
          <DataRow
            label={t('students.details.educationalSystem')}
            value={currentLang === 'ar' ? student.educationalSystem : student.educationalSystemEn}
          />
          <DataRow
            label={t('students.details.educationalStage')}
            value={currentLang === 'ar' ? student.educationalStage : student.educationalStageEn}
          />
          <DataRow
            label={t('students.details.className')}
            value={currentLang === 'ar' ? student.className : student.classNameEn}
          />
        </dl>
      </SectionCard>

      <SectionCard title={t('students.details.guardianData')}>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
          <DataRow label={t('students.details.phone')} value={student.guardianPhone} />
          <DataRow label={t('students.details.email')} value={student.guardianEmail} />
          <DataRow label={t('students.details.country')} value="مصر" />
          <DataRow
            label={t('students.details.nationality')}
            value={currentLang === 'ar' ? student.nationality : student.nationalityEn}
          />
          <DataRow
            label={t('students.details.address')}
            value={currentLang === 'ar' ? student.address : student.addressEn}
            fullWidth
          />
        </dl>
      </SectionCard>

      <SectionCard title={t('students.details.childData')}>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
          <DataRow label={t('students.details.birthDate')} value={student.birthDate} />
          <DataRow
            label={t('students.details.schoolName')}
            value={currentLang === 'ar' ? student.schoolName : student.schoolNameEn}
          />
          <DataRow
            label={t('students.details.educationalStage')}
            value={currentLang === 'ar' ? student.educationalStage : student.educationalStageEn}
          />
          <DataRow
            label={t('students.details.className')}
            value={currentLang === 'ar' ? student.className : student.classNameEn}
          />
        </dl>
      </SectionCard>

      <SectionCard title={t('students.details.attachments')}>
        <div className="flex flex-col gap-3">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-[#EDEDED] bg-white p-3"
            >
              <div className="flex items-center gap-3">
                <CustomImage src={PdfIcon} alt="PDF" className="h-10 w-9 flex-shrink-0" />
                <div className="text-start">
                  <p className="text-sm font-medium text-[#0E1F1F]">
                    {currentLang === 'ar' ? attachment.name : attachment.nameEn}
                  </p>
                  <p className="text-xs font-normal text-[#646969]">{attachment.size}</p>
                </div>
              </div>
              <button
                type="button"
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#E7F2FB] transition-colors hover:bg-[#D5E9F7]"
                title={t('common.download')}
                aria-label={t('common.download')}
              >
                <CustomImage src={DownloadIcon} alt="" className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </SectionCard>

      <ReassignStudentPopup
        isOpen={showReassignPopup}
        onClose={() => setShowReassignPopup(false)}
        onConfirm={handleReassignConfirm}
        isProcessing={isReassigning}
      />
    </Card>
  );
}
