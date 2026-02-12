import React from 'react';
import { useTranslation } from 'react-i18next';
import type { StudentApplicationDetailDto } from '@/services/api/student-applications/student-applications.types';

interface ApplicationChildInfoProps {
  data: StudentApplicationDetailDto;
}

const ApplicationChildInfo: React.FC<ApplicationChildInfoProps> = ({ data }) => {
  const { t } = useTranslation();

  return (
    <div className="mb-8 rounded-2xl border border-gray-200 p-6">
      <h2 className="mb-4 text-start text-lg font-bold text-gray-900">
        {t('studentApplications.details.childInfo')}
      </h2>
      <div className="space-y-4 text-sm">
        {/* Row 1: Birth Date and Previous School */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800">
              {t('studentApplications.details.birthDate')}:
            </span>
            <span className="text-gray-600">{new Date(data.dateOfBirth).toLocaleDateString()}</span>
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
  );
};

export default ApplicationChildInfo;
