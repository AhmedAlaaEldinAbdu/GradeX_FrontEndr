import React from 'react';
import { useTranslation } from 'react-i18next';
import type { StudentApplicationDetailDto } from '@/services/api/student-applications/student-applications.types';

interface ApplicationTuitionFeesProps {
  data: StudentApplicationDetailDto;
}

const ApplicationTuitionFees: React.FC<ApplicationTuitionFeesProps> = ({ data }) => {
  const { t } = useTranslation();

  return (
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
  );
};

export default ApplicationTuitionFees;
