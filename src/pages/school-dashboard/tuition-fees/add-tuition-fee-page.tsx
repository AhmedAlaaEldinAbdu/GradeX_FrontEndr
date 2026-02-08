import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import Card from '@/shared/components/Card';
import PopupMessage from '@/shared/popups/PopupMessage';
import AddEditTuitionFeeForm, {
  type TuitionFeeFormValues,
} from './components/AddEditTuitionFeeForm';
import { useAppDispatch } from '@/hooks/useRedux';
import { tokenManager } from '@/lib/auth';
import { createTuitionFees } from '@/redux/features/tuition-fees/tuitionFeesSlice';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';

export default function AddTuitionFeePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
    isRaw: boolean;
  }>({ show: false, type: 'success', message: '', isRaw: false });

  const schoolBranchId =
    tokenManager.getUserData()?.schoolBranchId ?? '41b6a93d-947c-4d58-959a-08de1c988710';

  const breadcrumbItems = [
    { label: t('sidebar.fees'), path: '/fees' },
    { label: t('fees.tuition.addTitle') },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="fees.tuition.addTitle" />

      <Card className="rounded-2xl" padding="lg">
        <AddEditTuitionFeeForm
          schoolBranchId={schoolBranchId}
          onCancel={() => navigate('/fees')}
          onSubmit={async (values: TuitionFeeFormValues) => {
            const payload = {
              schoolBrancheId: schoolBranchId,
              tuitionAmount: Number(values.tuitionAmount || 0),
              gradeId: values.educationalStageId,
              installmentPlansDto: values.installmentPlans.map((p) => ({
                id: undefined,
                installmentsCount: p.rows.length,
                distributionType: p.dueMode === 'equal' ? 1 : 2,
                installmentDto: p.rows.map((r) => {
                  const dueDate = r.dueDate.includes('T') ? r.dueDate : `${r.dueDate}T00:00:00.000Z`;
                  if (p.dueMode === 'equal') return { dueDate };
                  return { dueDate, percentage: Number(r.percentage || 0) };
                }),
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

            try {
              const res = await dispatch(createTuitionFees(payload)).unwrap();
              if (res?.isSuccess === true) {
                setShowPopupMessage({
                  show: true,
                  type: 'success',
                  message: 'fees.tuition.messages.addSuccess',
                  isRaw: false,
                });
              } else {
                setShowPopupMessage({
                  show: true,
                  type: 'error',
                  message: 'common.errorOccurred',
                  isRaw: false,
                });
              }
            } catch {
              setShowPopupMessage({
                show: true,
                type: 'error',
                message: 'common.errorOccurred',
                isRaw: false,
              });
            }
          }}
        />
      </Card>

      <PopupMessage
        open={showPopupMessage.show}
        type={showPopupMessage.type}
        message={showPopupMessage.message}
        isMessageRaw={showPopupMessage.isRaw}
        iconSrc={showPopupMessage.type === 'success' ? BigSuccessIcon : XMarkDangerIcon}
        autoClose={showPopupMessage.type === 'success'}
        onClose={() => setShowPopupMessage({ ...showPopupMessage, show: false })}
        navigateAfterClose={showPopupMessage.type === 'success' ? '/fees' : undefined}
      />
    </div>
  );
}
