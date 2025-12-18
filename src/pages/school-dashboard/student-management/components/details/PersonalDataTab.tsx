import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import DownloadIcon from '@gradex/assets/icons/Download.svg';
import CustomImage from '@/shared/components/CustomImage';

interface PersonalDataTabProps {
  student: {
    fullName: string;
    fullNameEn: string;
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
  const currentLang = i18n.language as 'ar' | 'en';

  const attachments = [
    { id: '1', name: 'هوية ولي الأمر', nameEn: 'Guardian ID', size: '526 KB' },
    { id: '2', name: 'الهوية التعليمية', nameEn: 'Educational ID', size: '526 KB' },
    { id: '3', name: 'شهادة التطعيم', nameEn: 'Vaccination Certificate', size: '526 KB' },
    {
      id: '4',
      name: 'شهادة التعليمية الأخير',
      nameEn: 'Last Educational Certificate',
      size: '526 KB',
    },
    { id: '5', name: 'الصور', nameEn: 'Photos', size: '526 KB' },
  ];

  const DataRow = ({
    label,
    value,
    fullWidth = false,
  }: {
    label: string;
    value: string;
    fullWidth?: boolean;
  }) => (
    <div className={fullWidth ? 'col-span-2' : ''}>
      <dt className="mb-2 text-sm font-medium text-gray-500">{label}</dt>
      <dd className="text-base text-gray-900">{value}</dd>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Housing Data بيانات التسكين */}
      <Card>
        <h2 className="mb-6 text-lg font-semibold text-gray-900">
          {t('students.details.housingData')}
        </h2>
        <dl className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
      </Card>

      {/* Guardian Data بيانات ولي الأمر */}
      <Card>
        <h2 className="mb-6 text-lg font-semibold text-gray-900">
          {t('students.details.guardianData')}
        </h2>
        <dl className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <DataRow
            label={t('students.details.guardianName')}
            value={currentLang === 'ar' ? student.guardianName : student.guardianNameEn}
          />
          <DataRow
            label={t('students.details.relationship')}
            value={currentLang === 'ar' ? student.relationship : student.relationshipEn}
          />
          <DataRow label={t('students.details.phone')} value={student.guardianPhone} />
          <DataRow label={t('students.details.email')} value={student.guardianEmail} />
          <DataRow
            label={t('students.details.nationality')}
            value={currentLang === 'ar' ? student.nationality : student.nationalityEn}
          />
          <DataRow label={t('students.details.country')} value="مصر" />
          <DataRow
            label={t('students.details.address')}
            value={currentLang === 'ar' ? student.address : student.addressEn}
            fullWidth
          />
        </dl>
      </Card>

      {/* Child Data بيانات الطفل */}
      <Card>
        <h2 className="mb-6 text-lg font-semibold text-gray-900">
          {t('students.details.childData')}
        </h2>
        <dl className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <DataRow
            label={t('students.details.schoolName')}
            value={currentLang === 'ar' ? student.schoolName : student.schoolNameEn}
          />
          <DataRow label={t('students.details.birthDate')} value={student.birthDate} />
          <DataRow
            label={t('students.details.className')}
            value={currentLang === 'ar' ? student.className : student.classNameEn}
          />
          <DataRow
            label={t('students.details.educationalStage')}
            value={currentLang === 'ar' ? student.educationalStage : student.educationalStageEn}
          />
        </dl>
      </Card>

      {/* Attachments المرفقات */}
      <Card>
        <h2 className="mb-6 text-lg font-semibold text-gray-900">
          {t('students.details.attachments')}
        </h2>
        <div className="space-y-3">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  <span className="text-xs font-semibold text-red-600">PDF</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {currentLang === 'ar' ? attachment.name : attachment.nameEn}
                  </p>
                  <p className="text-xs text-gray-500">{attachment.size}</p>
                </div>
              </div>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 transition-colors hover:bg-gray-200"
                title={t('common.download')}
              >
                <CustomImage src={DownloadIcon} alt="download" className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
