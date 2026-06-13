import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import Card from '@/shared/components/Card';
import PopupMessage from '@/shared/popups/PopupMessage';
import { useAppDispatch } from '@/hooks/useRedux';
import { tokenManager } from '@/lib/auth';
import { createOffer, fetchOffers } from '@/redux/features/offers/offersSlice';
import { useToast } from '@/shared/context/ToastContext';
import { formatValidationErrors } from '@/lib/utils/error-utils';
import { resolveErrorMessage } from '@/lib/http';
import AddEditDiscountOfferForm, {
  type DiscountOfferFormValues,
} from './components/AddEditDiscountOfferForm';
import { formValuesToOfferPayload } from './utils/discount-offer-mappers';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';

export default function AddDiscountOfferPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
    isRaw: boolean;
  }>({ show: false, type: 'success', message: '', isRaw: false });

  const schoolBranchId = tokenManager.getUserData()?.schoolBranchId ?? '';

  const breadcrumbItems = [
    { label: t('sidebar.financialAffairs') },
    { label: t('sidebar.financialManagement') },
    { label: t('sidebar.fees'), path: '/financial-management/fees?tab=discounts' },
    { label: t('fees.discounts.form.addTitle') },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="fees.discounts.form.addTitle" />

      <Card className="rounded-2xl" padding="lg">
        <AddEditDiscountOfferForm
          mode="add"
          onCancel={() => navigate('/financial-management/fees?tab=discounts')}
          onSubmit={async (offers: DiscountOfferFormValues[]) => {
            if (!schoolBranchId) {
              showToast({ message: t('common.error'), type: 'error' });
              return;
            }

            try {
              await Promise.all(
                offers.map((o) =>
                  dispatch(createOffer(formValuesToOfferPayload(schoolBranchId, o)))
                    .unwrap()
                    .then((res) => {
                      if (res.isSuccess) {
                        dispatch(
                          fetchOffers({
                            SchoolBranchId: schoolBranchId,
                            PageIndex: 1,
                            PageSize: 10,
                          })
                        );
                        setShowPopupMessage({
                          show: true,
                          type: 'success',
                          message: 'fees.discounts.messages.addSuccess',
                          isRaw: false,
                        });
                      } else {
                        const { message, isRaw } = resolveErrorMessage(res?.message);
                        setShowPopupMessage({
                          show: true,
                          type: 'error',
                          message,
                          isRaw,
                        });
                      }
                    })
                )
              );
            } catch (err) {
              // unwrap() rejects with the payload passed to rejectWithValue.
              // Our offers thunks pass { validationErrors } for 400 validation failures.
              const formatted = formatValidationErrors(
                (err as any)?.validationErrors,
                t('common.errorOccurred')
              );

              showToast({ message: formatted.split('\n')[0] ?? t('common.error'), type: 'error' });
              setShowPopupMessage({
                show: true,
                type: 'error',
                message: formatted,
                isRaw: true,
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
        navigateAfterClose={
          showPopupMessage.type === 'success'
            ? '/financial-management/fees?tab=discounts'
            : undefined
        }
      />
    </div>
  );
}
