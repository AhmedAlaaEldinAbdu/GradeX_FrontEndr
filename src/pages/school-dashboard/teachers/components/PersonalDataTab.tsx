import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import DefaultAvatar from '@gradex/assets/images/profile.png';
import DownloadIcon from '@gradex/assets/icons/Download.svg';
import PdfIcon from '@gradex/assets/icons/Pdf.svg';
import type { TeacherDetails } from '../../data/mockTeacherData';

interface PersonalDataTabProps {
  teacher: TeacherDetails;
}

export default function PersonalDataTab({ teacher }: PersonalDataTabProps) {
  const { t } = useTranslation();

  const handleDownload = (url: string, fileName: string) => {
    console.log('Downloading:', fileName, url);
  };

  return (
    <div className="space-y-6">
      {/* Profile Picture and Attachments */}
      <Card>
        {/* Profile Picture - Centered */}
        <div className="mb-8 flex justify-center">
          <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-gray-100 shadow-md">
            <CustomImage
              src={teacher.pictureProfilePath || DefaultAvatar}
              alt={teacher.fullName}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Attachments Section */}
        <div>
          <h3 className="mb-4 text-start text-lg font-semibold text-gray-900">
            {t('teachers.details.attachments')}
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {teacher.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                    <CustomImage src={PdfIcon} alt="PDF" className="h-5 w-5" />
                  </div>
                  <div className="text-start">
                    <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                    <p className="text-xs text-gray-500">{attachment.size}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownload(attachment.url, attachment.name)}
                  className="rounded-lg p-2 text-primary-600 transition-colors hover:bg-gray-200"
                  title={t('common.download')}
                >
                  <CustomImage src={DownloadIcon} alt="Download" className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Personal Information */}
      <Card>
        <h3 className="mb-6 text-start text-lg font-semibold text-gray-900">
          {t('teachers.details.personalInfo')}
        </h3>
        <div className="grid grid-cols-1 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
          <InfoRow
            label={t('teachers.details.phone')}
            value={`${teacher.countryCode} ${teacher.phoneNumber}`}
          />
          <InfoRow label={t('teachers.details.email')} value={teacher.email} />
          <InfoRow label={t('teachers.details.maritalStatus')} value={teacher.maritalStatus} />
          <InfoRow label={t('teachers.details.nationality')} value={teacher.nationality} />
          <InfoRow label={t('teachers.details.country')} value={teacher.country} />
          <InfoRow label={t('teachers.details.residenceCountry')} value={teacher.country} />
          <InfoRow label={t('teachers.details.idNumber')} value={teacher.idNumber} />
          <InfoRow label={t('teachers.details.idType')} value={teacher.idType} />
          <InfoRow label={t('teachers.details.dateOfBirth')} value={teacher.dateOfBirth} />
        </div>
        <div className="mt-4 border-t border-gray-100 pt-4">
          <InfoRow label={t('teachers.details.address')} value={teacher.address} />
        </div>
      </Card>

      {/* Educational Qualifications */}
      <Card>
        <h3 className="mb-6 text-start text-lg font-semibold text-gray-900">
          {t('teachers.details.educationalQualifications')}
        </h3>
        {teacher.qualifications.map((qualification) => (
          <div
            key={qualification.id}
            className="grid grid-cols-1 gap-y-4 md:grid-cols-2 lg:grid-cols-4"
          >
            <InfoRow label={t('teachers.details.university')} value={qualification.university} />
            <InfoRow label={t('teachers.details.degree')} value={qualification.degree} />
            <InfoRow label={t('teachers.details.subject')} value={qualification.subject} />
            <InfoRow
              label={t('teachers.details.graduationYear')}
              value={qualification.graduationYear}
            />
          </div>
        ))}
      </Card>

      {/* Training Courses */}
      <Card>
        <h3 className="mb-6 text-start text-lg font-semibold text-gray-900">
          {t('teachers.details.trainingCourses')}
        </h3>
        {teacher.trainingCourses.map((course) => (
          <div key={course.id} className="grid grid-cols-1 gap-y-4 md:grid-cols-2">
            <InfoRow label={t('teachers.details.courseName')} value={course.courseName} />
            <InfoRow label={t('teachers.details.duration')} value={course.duration} />
          </div>
        ))}
      </Card>

      {/* Work Experience */}
      <Card>
        <h3 className="mb-6 text-start text-lg font-semibold text-gray-900">
          {t('teachers.details.workExperience')}
        </h3>
        <div className="space-y-4">
          <InfoRow
            label={t('teachers.details.yearsOfExperience')}
            value={`${teacher.yearsOfExperience} ${t('teachers.details.years')}`}
          />
          <div>
            <p className="mb-2 text-start text-sm text-gray-600">
              {t('teachers.details.previousExperiences')}
            </p>
            <ul className="space-y-1 text-start text-gray-900">
              {teacher.experiences.map((exp) => (
                <li key={exp.id}>
                  {exp.position} — {exp.organization} ({exp.period})
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Skills and Languages */}
      <Card>
        <h3 className="mb-6 text-start text-lg font-semibold text-gray-900">
          {t('teachers.details.skillsAndLanguages')}
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="text-start">
            <p className="mb-2 text-sm text-gray-600">{t('teachers.details.languagesAndLevels')}</p>
            <ul className="space-y-1 text-gray-900">
              {teacher.languages.map((lang, index) => (
                <li key={index}>
                  {lang.language}: {lang.level}
                </li>
              ))}
            </ul>
          </div>
          <div className="text-start">
            <p className="mb-2 text-sm text-gray-600">{t('teachers.details.computerSkills')}</p>
            <ul className="space-y-1 text-gray-900">
              {teacher.skills.map((skill, index) => (
                <li key={index}>{skill.level ? `${skill.name} — ${skill.level}` : skill.name}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="text-start">
      <span className="text-sm text-gray-600">{label}: </span>
      <span className="text-gray-900">
        <bdi>{value}</bdi>
      </span>
    </div>
  );
}
