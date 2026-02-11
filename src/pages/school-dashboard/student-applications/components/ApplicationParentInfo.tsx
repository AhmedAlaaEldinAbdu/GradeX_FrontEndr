import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ParentInfo } from '@/services/api/student-applications/student-applications.types';

interface ApplicationParentInfoProps {
  parentInfo: ParentInfo;
}

const ApplicationParentInfo: React.FC<ApplicationParentInfoProps> = ({ parentInfo }) => {
  const { t } = useTranslation();

  return (
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
              -
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800">
              {t('studentApplications.details.email')}:
            </span>
            <span className="text-gray-600">{parentInfo.email}</span>
          </div>
        </div>
        {/* Row 2: Country and Nationality */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800">
              {t('studentApplications.details.country')}:
            </span>
            <span className="text-gray-600">{parentInfo.lkCountryName || '-'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800">
              {t('studentApplications.details.nationality')}:
            </span>
            <span className="text-gray-600">-</span>
          </div>
        </div>
        {/* Row 3: Address (full width) */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-800">
            {t('studentApplications.details.address')}:
          </span>
          <span className="text-gray-600">
            {[
              parentInfo.cityName,
              parentInfo.districtName,
              parentInfo.streetName,
              parentInfo.buildingNumber,
            ]
              .filter(Boolean)
              .join(' – ') || '-'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ApplicationParentInfo;
