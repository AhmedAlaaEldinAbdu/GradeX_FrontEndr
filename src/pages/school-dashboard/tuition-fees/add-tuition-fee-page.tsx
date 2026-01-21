import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import Card from '@/shared/components/Card';
import TuitionFeeForm, { type TuitionFeeFormValues } from './components/TuitionFeeForm';
import { useAppDispatch } from '@/hooks/useRedux';
import { tokenManager } from '@/lib/auth';
import { createTuitionFees } from '@/redux/features/tuition-fees/tuitionFeesSlice';

export default function AddTuitionFeePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const schoolBranchId = tokenManager.getUserData()?.schoolBranchId ?? '41b6a93d-947c-4d58-959a-08de1c988710';

  const breadcrumbItems = [
    { label: t('sidebar.fees'), path: '/fees' },
    { label: t('fees.tuition.addTitle') },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="fees.tuition.addTitle" />

      <Card className="rounded-2xl" padding="lg">
        <TuitionFeeForm
          schoolBranchId={schoolBranchId}
          onCancel={() => navigate('/fees')}
          onSubmit={async (values: TuitionFeeFormValues) => {
            const payload = {
              schoolBrancheId: schoolBranchId,
              tuitionAmount: Number(values.tuitionAmount || 0),
              gradeId: values.educationalStageId,
              installmentPlansDto: values.installmentPlans.map((p) => ({
                id: undefined,
                installmentsCount: p.paymentsCount,
                distributionType: p.dueMode === 'equal' ? 1 : 2,
                installmentDto: p.rows.map((r) => ({
                  dueDate: r.dueDate.includes('T') ? r.dueDate : `${r.dueDate}T00:00:00.000Z`,
                  percentage: Number(r.percentage || 0),
                })),
              })),
              tuitionFeesServicesDto: values.includedServices.map((s) => ({
                nameAr: s.nameAr,
                nameEn: s.nameEn,
              })),
              tuitionFeesPaidServicesDto: values.paidServices.map((s) => ({
                id: undefined,
                nameAr: s.nameAr,
                nameEn: s.nameEn,
                amount: Number(s.amount || 0),
              })),
              paymentMethodIds: values.paymentMethodIds,
            };

            await dispatch(createTuitionFees(payload)).unwrap();
            navigate('/fees');
          }}
        />
      </Card>
    </div>
  );
}
