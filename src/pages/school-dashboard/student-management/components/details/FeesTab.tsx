import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import CustomCheckbox from '@/shared/components/CustomCheckbox';
import Input from '@/shared/components/Input';

interface FeesTabProps {
  studentId: string;
}

interface ServiceItem {
  id: string;
  name: string;
  nameEn: string;
  price: number | null;
  checked: boolean;
}

interface PaymentSchedule {
  id: string;
  date: string;
  percentage: number;
}

const includedServicesLeft: ServiceItem[] = [
  { id: 'i1', name: 'الزي المدرسي', nameEn: 'School Uniform', price: 290, checked: true },
  { id: 'i2', name: 'الكتب', nameEn: 'Books', price: 130, checked: true },
  { id: 'i3', name: 'ركوب الخيل', nameEn: 'Horse Riding', price: 23, checked: false },
  {
    id: 'i4',
    name: 'أزياء العروض المسرحية',
    nameEn: 'Theater Costumes',
    price: 23,
    checked: false,
  },
  { id: 'i5', name: 'أخري', nameEn: 'Other', price: null, checked: false },
];

const includedServicesRight: ServiceItem[] = [
  { id: 'i6', name: 'الرحلات المدرسية', nameEn: 'School Trips', price: 67, checked: true },
  { id: 'i7', name: 'حجز الباص', nameEn: 'Bus Booking', price: 80, checked: true },
  { id: 'i8', name: 'الكتب', nameEn: 'Books', price: 70, checked: true },
  { id: 'i9', name: 'الرماية', nameEn: 'Archery', price: 80, checked: false },
];

const paidServicesLeft: ServiceItem[] = [
  { id: 'p1', name: 'الزي المدرسي', nameEn: 'School Uniform', price: 290, checked: false },
  { id: 'p2', name: 'الكتب', nameEn: 'Books', price: 130, checked: false },
  { id: 'p3', name: 'ركوب الخيل', nameEn: 'Horse Riding', price: 23, checked: true },
  { id: 'p4', name: 'أزياء العروض المسرحية', nameEn: 'Theater Costumes', price: 23, checked: true },
  { id: 'p5', name: 'أخري', nameEn: 'Other', price: null, checked: true },
];

const paidServicesRight: ServiceItem[] = [
  { id: 'p6', name: 'الرحلات المدرسية', nameEn: 'School Trips', price: 67, checked: false },
  { id: 'p7', name: 'حجز الباص', nameEn: 'Bus Booking', price: 80, checked: false },
  { id: 'p8', name: 'الكتب', nameEn: 'Books', price: 70, checked: false },
  { id: 'p9', name: 'الرماية', nameEn: 'Archery', price: 80, checked: true },
];

const mockPaymentSchedule: PaymentSchedule[] = [
  { id: '1', date: '22/2/2024', percentage: 40 },
  { id: '2', date: '22/3/2024', percentage: 30 },
  { id: '3', date: '22/4/2024', percentage: 30 },
];

export default function FeesTab(_props: FeesTabProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';

  const [paymentOption, setPaymentOption] = useState<'equal' | 'ratio'>('ratio');

  const ServiceRow = ({ service }: { service: ServiceItem }) => (
    <div className="flex items-center justify-between py-2">
      <CustomCheckbox
        checked={service.checked}
        onChange={() => {}}
        label={currentLang === 'ar' ? service.name : service.nameEn}
        disabled
      />
      {service.price !== null && (
        <span className="text-sm text-[#646969]">
          {service.price} {t('fees.currency')}
        </span>
      )}
    </div>
  );

  const ServicesGrid = ({
    leftColumn,
    rightColumn,
  }: {
    leftColumn: ServiceItem[];
    rightColumn: ServiceItem[];
  }) => (
    <div className="grid grid-cols-1 gap-x-12 md:grid-cols-2">
      <div className="flex flex-col">
        {rightColumn.map((s) => (
          <ServiceRow key={s.id} service={s} />
        ))}
      </div>
      <div className="flex flex-col">
        {leftColumn.map((s) => (
          <ServiceRow key={s.id} service={s} />
        ))}
      </div>
    </div>
  );

  const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-2xl border border-[#EDEDED] p-5">
      <h3 className="mb-4 text-base font-medium text-[#0E1F1F]">{title}</h3>
      {children}
    </div>
  );

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-2xl border border-[#EDEDED] p-4">
          <h2 className="text-base font-medium text-[#0E1F1F]">{t('fees.totalExpenses')}</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#9CA3AF] line-through">5,900</span>
            <span className="text-base font-semibold text-[#1A9F58]">
              5,500 <span className="text-sm font-normal">{t('fees.currency')}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 rounded-2xl border border-[#EDEDED] p-5 md:grid-cols-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-[#0E1F1F]">{t('fees.paymentMethod')}:</span>
            <span className="text-[#646969]">
              {t('fees.installmentPlan')} (3 {t('fees.months')})
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-[#0E1F1F]">{t('fees.discount')}:</span>
            <span className="text-[#646969]">{t('fees.siblingsDiscount')} 15%</span>
          </div>
        </div>

        <SectionCard title={t('fees.servicesIncluded')}>
          <ServicesGrid leftColumn={includedServicesLeft} rightColumn={includedServicesRight} />
        </SectionCard>

        <SectionCard title={t('fees.paidServices')}>
          <ServicesGrid leftColumn={paidServicesLeft} rightColumn={paidServicesRight} />

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-[#646969]">{t('fees.service')}</label>
              <Input value={t('fees.swimmingLessons')} readOnly className="bg-[#F5F5F5]" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-[#646969]">{t('fees.amount')}</label>
              <Input value="80" readOnly className="bg-[#F5F5F5]" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title={t('fees.installmentPlanTitle')}>
          <div className="mb-6">
            <label className="mb-2 block text-sm text-[#646969]">
              {t('fees.numberOfPayments')} <span className="text-red-500">*</span>
            </label>
            <Input value={`3 ${t('fees.months')}`} readOnly />
          </div>

          <div className="mb-6">
            <label className="mb-3 block text-sm text-[#646969]">
              {t('fees.paymentDueOptions')}
            </label>
            <div className="flex flex-wrap items-center gap-8">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[#0E1F1F]">
                <input
                  type="radio"
                  name="paymentOption"
                  value="equal"
                  checked={paymentOption === 'equal'}
                  onChange={() => setPaymentOption('equal')}
                  className="h-4 w-4 accent-green-500"
                />
                <span>{t('fees.equalPayments')}</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[#0E1F1F]">
                <input
                  type="radio"
                  name="paymentOption"
                  value="ratio"
                  checked={paymentOption === 'ratio'}
                  onChange={() => setPaymentOption('ratio')}
                  className="h-4 w-4 accent-green-500"
                />
                <span>{t('fees.ratioPerPayment')}</span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            {mockPaymentSchedule.map((payment) => (
              <div key={payment.id} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-[#646969]">{t('fees.dueDate')}</label>
                  <Input
                    type="date"
                    value={toIsoDate(payment.date)}
                    readOnly
                    className="bg-[#F5F5F5]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-[#646969]">
                    {t('fees.percentage')}
                  </label>
                  <Input value={`${payment.percentage}%`} readOnly className="bg-[#F5F5F5]" />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </Card>
  );
}

function toIsoDate(date: string): string {
  const [d, m, y] = date.split('/');
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}
