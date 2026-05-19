import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchTuitionFeesByGradeAndSchoolBranch } from '@/redux/features/tuition-fees/tuitionFeesSlice';
import Card from '@/shared/components/Card';
import Loading from '@/shared/components/Loading';
import CustomImage from '@/shared/components/CustomImage';
import CustomCheckbox from '@/shared/components/CustomCheckbox';
import RyalGreenIcon from '@gradex/assets/icons/RyalGreen.svg';

interface FeesTabProps {
  studentId: string;
  gradeId?: string | null;
  schoolBranchId?: string | null;
}

const formatNumber = (value: number | null | undefined) =>
  value == null ? '-' : value.toLocaleString('en-US');

const formatDate = (value: string) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-GB');
};

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-2xl border border-[#EDEDED] p-5">
    <h3 className="flex mb-4 text-base font-medium text-[#0E1F1F]">{title}</h3>
    {children}
  </div>
);

export default function FeesTab({ gradeId, schoolBranchId }: FeesTabProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const fees = useAppSelector((state) => state.tuitionFees.tuitionFeesByGradeAndBranch);
  const isLoading = useAppSelector((state) => state.tuitionFees.isLoadingDetails);

  useEffect(() => {
    if (!gradeId || !schoolBranchId) return;
    dispatch(
      fetchTuitionFeesByGradeAndSchoolBranch({
        gradId: gradeId,
        schoolBrancheId: schoolBranchId,
      })
    );
  }, [dispatch, gradeId, schoolBranchId]);

  if (isLoading) {
    return (
      <Card>
        <div className="flex min-h-[240px] items-center justify-center">
          <Loading size="lg" />
        </div>
      </Card>
    );
  }

  if (!fees) {
    return (
      <Card>
        <div className="flex min-h-[240px] items-center justify-center text-sm text-[#646969]">
          {t('fees.noFees')}
        </div>
      </Card>
    );
  }

  const plan = fees.installmentPlansDto?.[0];

  const ServiceList = ({
    items,
  }: {
    items: { id: string; name: string; amount: number | null }[];
  }) =>
    items.length === 0 ? (
      <p className="text-sm text-[#9CA3AF]">-</p>
    ) : (
      <div className="grid grid-cols-1 gap-x-12 md:grid-cols-2">
        {items.map((s) => (
          <div key={s.id || s.name} className="flex items-center justify-between py-2">
            <CustomCheckbox checked disabled onChange={() => {}} label={s.name} />
            {s.amount != null && (
              <span className="text-sm text-[#646969]">
                {formatNumber(s.amount)} {t('fees.currency')}
              </span>
            )}
          </div>
        ))}
      </div>
    );

  return (
    <Card>
      <div className="space-y-4">
        {/* Total tuition + grade */}
        <div className="flex items-center justify-between rounded-2xl border border-[#EDEDED] p-4">
          <div>
            <h2 className="text-base font-medium text-green-500">{t('fees.totalExpenses')}</h2>
            <p className="mt-1 text-sm text-[#646969]">
              {t('fees.grade')}: {fees.gradeName}
            </p>
          </div>
          <span className="flex items-center gap-1 text-base font-semibold text-green-500">
            {formatNumber(fees.tuitionAmount)}
            <CustomImage src={RyalGreenIcon} alt={t('fees.currency')} className="h-4 w-4" />
          </span>
        </div>

        {/* Payment methods */}
        {fees.paymentMethodIds?.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#EDEDED] p-4 text-sm">
            <span className="font-medium text-[#0E1F1F]">{t('fees.paymentMethods')}:</span>
            <span className="text-[#646969]">
              {fees.paymentMethodIds.map((m) => m.name).join('، ')}
            </span>
          </div>
        )}

        {/* Offers & discounts */}
        {fees.offers?.length > 0 && (
          <SectionCard title={t('fees.offers')}>
            <div className="space-y-2">
              {fees.offers.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between border-b border-[#F0F0F0] py-2 last:border-0"
                >
                  <span className="text-sm text-[#0E1F1F]">{o.name}</span>
                  <span className="text-sm text-[#646969]">
                    {o.percentage != null
                      ? `${o.percentage}%`
                      : `${formatNumber(o.amount)} ${t('fees.currency')}`}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        <SectionCard title={t('fees.servicesIncluded')}>
          <ServiceList items={fees.tuitionFeesServicesDto ?? []} />
        </SectionCard>

        <SectionCard title={t('fees.paidServices')}>
          <ServiceList items={fees.tuitionFeesPaidServicesDto ?? []} />
        </SectionCard>

        {/* Books */}
        {fees.books?.length > 0 && (
          <SectionCard title={t('fees.books')}>
            <div className="space-y-2">
              {fees.books.map((b) => (
                <div
                  key={b.code || b.name}
                  className="flex items-center justify-between border-b border-[#F0F0F0] py-2 last:border-0 text-sm"
                >
                  <span className="text-[#0E1F1F]">{b.name}</span>
                  <span className="text-[#9CA3AF]">
                    {t('fees.code')}: {b.code || '-'}
                  </span>
                  <span className="text-[#646969]">
                    {formatNumber(b.price)} {t('fees.currency')}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Installment plan */}
        {plan && (
          <SectionCard title={t('fees.installmentPlanTitle')}>
            <div className="mb-4 flex flex-wrap gap-x-12 gap-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-[#0E1F1F]">{t('fees.numberOfPayments')}:</span>
                <span className="text-[#646969]">
                  {plan.installmentsCount} {t('fees.months')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-[#0E1F1F]">{t('fees.paymentDueOptions')}:</span>
                <span className="text-[#646969]">
                  {plan.distributionType === 1
                    ? t('fees.equalPayments')
                    : t('fees.ratioPerPayment')}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {(plan.installmentDto ?? []).map((inst, idx) => (
                <div
                  key={`${inst.dueDate}-${idx}`}
                  className="grid grid-cols-1 gap-4 md:grid-cols-2"
                >
                  <div className="flex items-center justify-between rounded-xl bg-[#F5F5F5] px-4 py-2 text-sm">
                    <span className="text-[#646969]">{t('fees.dueDate')}</span>
                    <span className="text-[#0E1F1F]">{formatDate(inst.dueDate)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-[#F5F5F5] px-4 py-2 text-sm">
                    <span className="text-[#646969]">{t('fees.percentage')}</span>
                    <span className="text-[#0E1F1F]">{inst.percentage ?? 0}%</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>
    </Card>
  );
}
