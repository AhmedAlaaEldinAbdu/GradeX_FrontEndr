import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import Card from '@/shared/components/Card';
import PopupMessage from '@/shared/popups/PopupMessage';
import AddEditTuitionFeeForm, {
  type TuitionFeeFormValues,
} from './components/AddEditTuitionFeeForm';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { tokenManager } from '@/lib/auth';
import {
  fetchTuitionFeesById,
  updateTuitionFees,
  clearTuitionFeesDetails,
} from '@/redux/features/tuition-fees/tuitionFeesSlice';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';

export default function EditTuitionFeePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
    isRaw: boolean;
  }>({ show: false, type: 'success', message: '', isRaw: false });

  const { tuitionFeesDetails } = useAppSelector((state) => state.tuitionFees);

  const schoolBranchId =
    tokenManager.getUserData()?.schoolBranchId ?? '';

  const breadcrumbItems = [
    { label: t('sidebar.fees'), path: '/fees' },
    { label: t('fees.tuition.editTitle') },
  ];

  useEffect(() => {
    if (!id) return;
    dispatch(fetchTuitionFeesById(id));
    return () => {
      dispatch(clearTuitionFeesDetails());
    };
  }, [dispatch, id]);

  const initialValues = useMemo<Partial<TuitionFeeFormValues>>(() => {
    if (!tuitionFeesDetails) return {};

    return {
      educationalStageId: tuitionFeesDetails.gradeId,
      tuitionAmount: String(tuitionFeesDetails.tuitionAmount ?? ''),
      includedServices: (tuitionFeesDetails.tuitionFeesServicesDto ?? []).map((s, idx) => ({
        id: `inc-${idx}`,
        nameAr: s.nameAr,
        nameEn: s.nameEn,
      })),
      paidServices: (tuitionFeesDetails.tuitionFeesPaidServicesDto ?? []).map((s, idx) => ({
        id: s.id ?? `paid-${idx}`,
        nameAr: s.nameAr,
        nameEn: s.nameEn,
        amount: String(s.amount ?? ''),
      })),
      paymentMethodIds: (tuitionFeesDetails.paymentMethodIds ?? [])
        .map((m) => m.paymentMethodId)
        .filter((x): x is string => !!x),
      installmentPlans: (tuitionFeesDetails.installmentPlansDto ?? []).map((p, planIdx) => ({
        id: p.id ?? `plan-${planIdx}`,
        paymentsCount:
          p.distributionType === 1 && (p.installmentsCount ?? 0) === 0
            ? Math.max(1, p.installmentDto?.length ?? 0)
            : p.installmentsCount,
        dueMode: p.distributionType === 1 ? 'equal' : 'ratio',
        rows: (p.installmentDto ?? []).map((r, idx) => ({
          id: `${p.id ?? `plan-${planIdx}`}-${idx}`,
          dueDate: (r.dueDate ?? '').split('T')[0],
          percentage: String(r.percentage ?? ''),
        })),
      })),
    };
  }, [tuitionFeesDetails]);

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="fees.tuition.editTitle" />

      <Card className="rounded-2xl" padding="lg">
        <AddEditTuitionFeeForm
          schoolBranchId={schoolBranchId}
          mode="edit"
          formKey={id}
          initialValues={initialValues}
          onCancel={() => navigate('/fees')}
          onSubmit={async (values: TuitionFeeFormValues) => {
            if (!id) return;

            const payload = {
              id,
              schoolBrancheId: schoolBranchId,
              tuitionAmount: Number(values.tuitionAmount || 0),
              gradeId: values.educationalStageId,
              installmentPlansDto: values.installmentPlans.map((p) => ({
                id: p.id,
                installmentsCount: p.rows.length,
                distributionType: p.dueMode === 'equal' ? 1 : 2,
                installmentDto: p.rows.map((r) => {
                  const dueDate = r.dueDate.includes('T')
                    ? r.dueDate
                    : `${r.dueDate}T00:00:00.000Z`;
                  if (p.dueMode === 'equal') return { dueDate };
                  return { dueDate, percentage: Number(r.percentage || 0) };
                }),
              })),
              tuitionFeesServicesDto: values.includedServices.map((s) => ({
                nameAr: s.nameAr,
                nameEn: s.nameEn,
              })),
              tuitionFeesPaidServicesDto: values.paidServices.map((s) => ({
                id: s.id,
                nameAr: s.nameAr,
                nameEn: s.nameEn,
                amount: Number(s.amount || 0),
              })),
              paymentMethodIds: values.paymentMethodIds,
            };

            try {
              const res = await dispatch(updateTuitionFees(payload)).unwrap();
              if (res?.isSuccess === true) {
                setShowPopupMessage({
                  show: true,
                  type: 'success',
                  message: 'fees.tuition.messages.editSuccess',
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
