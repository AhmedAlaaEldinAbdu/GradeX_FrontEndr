import React from 'react';
import { useTranslation } from 'react-i18next';
import type { StudentApplicationDetailDto } from '@/services/api/student-applications/student-applications.types';

interface ApplicationTuitionFeesProps {
  data: StudentApplicationDetailDto;
}

const ApplicationTuitionFees: React.FC<ApplicationTuitionFeesProps> = ({ data }) => {
  const { t } = useTranslation();

  if (!data) return null;

  const total = data.total;
  const discountTotal = data.discountTotal;
  const hasPaidServices = data.paidServices?.length > 0;
  const hasBooks = Boolean(data.books?.length);

  return (
    <div className="mb-8 rounded-2xl border border-gray-200 p-6">
      <h2 className="mb-4 text-start text-lg font-bold text-gray-900">
        {t('studentApplications.details.tuitionFees')}
      </h2>

      {/* Payment Method and Services */}
      <div className="mb-6 space-y-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-800">
            {t('studentApplications.details.paymentMethod')}:
          </span>
          <span className="text-gray-600">{data.paymentMethod || '-'}</span>
        </div>
        {data.services?.length > 0 && (
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
            {discountTotal !== null && discountTotal !== undefined && discountTotal > 0
              ? `${discountTotal.toLocaleString()} ${t('common.currencyRiyal')}`
              : '-'}
          </span>
        </div>
      </div>

      {/* Added Fees */}
      {(hasPaidServices || hasBooks) && (
        <>
          <div className="mb-4 text-start text-sm font-bold text-gray-800">
            {t('studentApplications.details.addedFees')}:
          </div>

          {hasPaidServices && (
            <div className="mb-6 grid grid-cols-2 gap-x-4 gap-y-4 md:grid-cols-4">
              {data.paidServices.map((service) => (
                <div key={service?.id || service?.name} className="text-center">
                  <p className="text-sm font-bold text-gray-800">{service?.name || '-'}</p>
                  <p className="text-sm text-gray-500">
                    {service?.amount?.toLocaleString() || '0'} {t('common.currencyRiyal')}
                  </p>
                </div>
              ))}
            </div>
          )}

          {hasBooks && (
            <div className="mb-6">
              <div className="mb-3 text-start text-sm font-bold text-gray-800">
                {t('studentApplications.details.books')}:
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {data.books?.map((book) => (
                  <div key={book.id} className="rounded-xl border border-gray-100 p-3 text-start">
                    <p className="text-sm font-bold text-gray-800">{book.name || '-'}</p>
                    {book.code && <p className="mt-1 text-xs text-gray-500">{book.code}</p>}
                    <p className="mt-2 text-sm text-gray-500">
                      {book.price?.toLocaleString() || '0'} {t('common.currencyRiyal')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Total - label on right (RTL), prices on left */}
      <div className="flex items-center justify-between rounded-xl border border-gray-100 p-3">
        <span className="text-sm font-bold text-green-700">
          {t('studentApplications.details.totalExpenses')}
        </span>
        <span className="text-xl font-bold text-green-600" dir="ltr">
          {total !== null && total !== undefined
            ? `${total.toLocaleString()} ${t('common.currencyRiyal')}`
            : '-'}
        </span>
      </div>
    </div>
  );
};

export default ApplicationTuitionFees;
