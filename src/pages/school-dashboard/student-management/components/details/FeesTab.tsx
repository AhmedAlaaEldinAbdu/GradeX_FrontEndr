import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomCheckbox from '@/shared/components/CustomCheckbox';

interface FeesTabProps {
  studentId: string;
}

interface ServiceItem {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  checked: boolean;
}

// Mock data matching the design
const mockIncludedServices: ServiceItem[] = [
  { id: '1', name: 'الزي المدرسي', nameEn: 'School Uniform', price: 290, checked: true },
  { id: '2', name: 'الكتب', nameEn: 'Books', price: 130, checked: true },
  { id: '3', name: 'ركوب الخيل', nameEn: 'Horse Riding', price: 23, checked: true },
  { id: '4', name: 'أزياء العروض المسرحية', nameEn: 'Theater Costumes', price: 23, checked: false },
  { id: '5', name: 'أخرى', nameEn: 'Other', price: 0, checked: false },
  { id: '6', name: 'الرحلات المدرسية', nameEn: 'School Trips', price: 87, checked: true },
  { id: '7', name: 'حافز الباص', nameEn: 'Bus Incentive', price: 80, checked: true },
  { id: '8', name: 'الكتب', nameEn: 'Books', price: 70, checked: true },
  { id: '9', name: 'الرعاية', nameEn: 'Care', price: 80, checked: false },
];

const mockPaidServices: ServiceItem[] = [
  { id: 'p1', name: 'الزي المدرسي', nameEn: 'School Uniform', price: 290, checked: true },
  { id: 'p2', name: 'الكتب', nameEn: 'Books', price: 130, checked: true },
  { id: 'p3', name: 'ركوب الخيل', nameEn: 'Horse Riding', price: 23, checked: true },
  { id: 'p4', name: 'أزياء العروض المسرحية', nameEn: 'Theater Costumes', price: 23, checked: true },
  { id: 'p5', name: 'أخرى', nameEn: 'Other', price: 0, checked: false },
  { id: 'p6', name: 'الرحلات المدرسية', nameEn: 'School Trips', price: 87, checked: true },
  { id: 'p7', name: 'حافز الباص', nameEn: 'Bus Incentive', price: 80, checked: false },
  { id: 'p8', name: 'الكتب', nameEn: 'Books', price: 70, checked: false },
  { id: 'p9', name: 'الرعاية', nameEn: 'Care', price: 80, checked: true },
];

interface PaymentSchedule {
  id: string;
  date: string;
  percentage: number;
}

const mockPaymentSchedule: PaymentSchedule[] = [
  { id: '1', date: '22/2/2024', percentage: 40 },
  { id: '2', date: '22/3/2024', percentage: 30 },
  { id: '3', date: '22/4/2024', percentage: 30 },
];

export default function FeesTab({ studentId }: FeesTabProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';

  const [selectedPaymentOption, setSelectedPaymentOption] = useState<'equal' | 'ratio'>('ratio');

  console.log('Student ID:', studentId);

  // Section Header Component
  const SectionHeader = ({ title }: { title: string }) => (
    <div className="mb-4 flex items-center gap-4">
      <h3 className="whitespace-nowrap text-base font-semibold text-gray-900">{title}</h3>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );

  return (
    <div className="rounded-xl bg-white p-6">
      {/* Total Expenses Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-primary-600">{t('fees.totalExpenses')}</h2>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary-600">5,500 {t('fees.currency')}</span>
          <span className="font-bold text-primary-600">↙</span>
          <span className="text-sm text-gray-400 line-through">6,900 -</span>
        </div>
      </div>

      {/* Payment Method Section */}
      <div className="mb-8 rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">{t('fees.paymentMethod')}:</span>
            <span className="text-gray-600">
              {t('fees.installmentPlan')} (3 {t('fees.months')})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">{t('fees.discount')}:</span>
            <span className="text-gray-600">{t('fees.siblingsDiscount')} 15%</span>
          </div>
        </div>
      </div>

      {/* Services & Activities Included Section */}
      <div className="mb-8">
        <SectionHeader title={t('fees.servicesIncluded')} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {mockIncludedServices.map((service) => (
            <div key={service.id} className="flex items-center justify-between">
              <CustomCheckbox
                checked={service.checked}
                onChange={() => {}}
                label={currentLang === 'ar' ? service.name : service.nameEn}
                disabled
              />
              {service.price > 0 && (
                <span className="text-sm text-gray-600">
                  {service.price} {t('fees.currency')}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Paid Services Section */}
      <div className="mb-8">
        <SectionHeader title={t('fees.paidServices')} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {mockPaidServices.map((service) => (
            <div key={service.id} className="flex items-center justify-between">
              <CustomCheckbox
                checked={service.checked}
                onChange={() => {}}
                label={currentLang === 'ar' ? service.name : service.nameEn}
                disabled
              />
              {service.price > 0 && (
                <span className="text-sm text-gray-600">
                  {service.price} {t('fees.currency')}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Service Summary */}
      <div className="mb-8 rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-start text-sm font-medium text-gray-600">
                {t('fees.service')}
              </th>
              <th className="px-4 py-3 text-start text-sm font-medium text-gray-600">
                {t('fees.amount')}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-200">
              <td className="px-4 py-3 text-sm text-gray-600">{t('fees.swimmingLessons')}</td>
              <td className="px-4 py-3 text-sm text-gray-600">80</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Installment Plan Section */}
      <div className="mb-8">
        <SectionHeader title={t('fees.installmentPlanTitle')} />

        {/* Number of Payments */}
        <div className="mb-4">
          <label className="mb-2 block text-sm text-gray-600">
            {t('fees.numberOfPayments')} <span className="text-red-500">*</span>
          </label>
          <div className="text-gray-700">3 {t('fees.months')}</div>
        </div>

        {/* Payment Due Options */}
        <div className="mb-6">
          <label className="mb-3 block text-sm text-gray-600">{t('fees.paymentDueOptions')}</label>
          <div className="flex items-center gap-6">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="paymentOption"
                value="equal"
                checked={selectedPaymentOption === 'equal'}
                onChange={() => setSelectedPaymentOption('equal')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-base text-black-800">{t('fees.equalPayments')}</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="paymentOption"
                value="ratio"
                checked={selectedPaymentOption === 'ratio'}
                onChange={() => setSelectedPaymentOption('ratio')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-base text-black-800">{t('fees.ratioPerPayment')}</span>
            </label>
          </div>
        </div>

        {/* Payment Schedule Table */}
        <div className="space-y-4">
          {mockPaymentSchedule.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between border-b border-gray-100 pb-4"
            >
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-sm text-gray-500">{t('fees.dueDate')}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700">{payment.date}</span>
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div>
                  <div className="text-sm text-gray-500">{t('fees.percentage')}</div>
                  <div className="text-gray-700">{payment.percentage}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
