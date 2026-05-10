import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import DownloadIcon from '@gradex/assets/icons/Download.svg';
import PdfIcon from '@gradex/assets/icons/Pdf.svg';
import CustomImage from '@/shared/components/CustomImage';
import DefaultAvatar from '@gradex/assets/images/profile.png';
import Card from '@/shared/components/Card';
import { getStudentFullName, type StudentDto } from '@/services/api/types/students.types';

interface PersonalDataTabProps {
  student: StudentDto;
}

const PLACEHOLDER = '-';

export default function PersonalDataTab({ student }: PersonalDataTabProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';

  const studentName = getStudentFullName(student);
  const birthDate = student.dateOfBirth
    ? format(parseISO(student.dateOfBirth), 'd/M/yyyy')
    : PLACEHOLDER;
  const guardianPhone =
    student.motherCountryCode && student.motherNumber
      ? `${student.motherCountryCode} ${student.motherNumber}`
      : PLACEHOLDER;

  const attachments = student.attachments ?? [];

  const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-2xl border border-[#DDE0E0] bg-white p-4">
      <h2 className="mb-6 text-start text-base font-medium text-[#0E1F1F]">{title}</h2>
      {children}
    </div>
  );

  const DataRow = ({
    label,
    value,
    fullWidth = false,
  }: {
    label: string;
    value: string | null | undefined;
    fullWidth?: boolean;
  }) => (
    <div
      className={`flex items-center gap-2 text-start text-base ${fullWidth ? 'md:col-span-2' : ''}`}
    >
      <span className="font-medium text-[#3A3A3A]">{label}:</span>
      <span className="font-normal text-[#646969]">{value || PLACEHOLDER}</span>
    </div>
  );

  return (
    <Card>
      <div className="space-y-6">
        <div className="rounded-2xl border border-[#C5F0DD] bg-[#EEFDF6] p-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-[#E6E6E6] bg-white">
              <CustomImage
                src={student.profilePicture || DefaultAvatar}
                fallbackSrc={DefaultAvatar}
                alt={studentName}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="text-start text-base font-medium text-[#0E1F1F]">{studentName}</p>
          </div>
        </div>

        <SectionCard title={t('students.details.housingData')}>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
            <DataRow label={t('students.details.systemType')} value={null} />
            <DataRow label={t('students.details.educationalSystem')} value={null} />
            <DataRow label={t('students.details.educationalStage')} value={student.grade} />
            <DataRow label={t('students.details.className')} value={student.className} />
          </dl>
        </SectionCard>

        <SectionCard title={t('students.details.guardianData')}>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
            <DataRow label={t('students.details.phone')} value={guardianPhone} />
            <DataRow label={t('students.details.email')} value={null} />
            <DataRow label={t('students.details.country')} value={student.lKCountries} />
            <DataRow label={t('students.details.nationality')} value={student.nationality} />
            <DataRow label={t('students.details.address')} value={null} fullWidth />
          </dl>
        </SectionCard>

        <SectionCard title={t('students.details.childData')}>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
            <DataRow label={t('students.details.birthDate')} value={birthDate} />
            <DataRow label={t('students.details.schoolName')} value={null} />
            <DataRow label={t('students.details.educationalStage')} value={student.grade} />
            <DataRow label={t('students.details.className')} value={student.className} />
          </dl>
        </SectionCard>

        {attachments.length > 0 && (
          <SectionCard title={t('students.details.attachments')}>
            <div className="flex flex-col gap-3">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-[#DDE0E0] bg-white px-3 py-2"
                >
                  <div className="flex items-center gap-4">
                    <CustomImage src={PdfIcon} alt="PDF" className="h-10 w-10 flex-shrink-0" />
                    <div className="text-start">
                      <p className="text-base font-normal text-[#0E1F1F]">
                        {currentLang === 'ar'
                          ? attachment.name
                          : attachment.nameEn || attachment.name}
                      </p>
                      {attachment.size && (
                        <p className="text-sm font-normal text-[#3A3A3A]">{attachment.size}</p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#117BD7]/10 transition-colors hover:bg-[#117BD7]/20"
                    title={t('common.download')}
                    aria-label={t('common.download')}
                  >
                    <CustomImage src={DownloadIcon} alt="" className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>
    </Card>
  );
}
