import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import Card from '@/shared/components/Card';
import PopupMessage from '@/shared/popups/PopupMessage';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { tokenManager } from '@/lib/auth';
import {
  clearOfferDetails,
  fetchOfferById,
  updateOffer,
  fetchOffers,
} from '@/redux/features/offers/offersSlice';
import { useToast } from '@/shared/context/ToastContext';
import { formatValidationErrors } from '@/lib/utils/error-utils';
import AddEditDiscountOfferForm, {
  type DiscountOfferFormValues,
} from './components/AddEditDiscountOfferForm';
import { offerDtoToFormValues, formValuesToOfferPayload } from './utils/discount-offer-mappers';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';

export default function EditDiscountOfferPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
    isRaw: boolean;
  }>({ show: false, type: 'success', message: '', isRaw: false });

  const { offerDetails, isLoadingDetails } = useAppSelector((state) => state.offers);

  const schoolBranchId = tokenManager.getUserData()?.schoolBranchId ?? '';

  useEffect(() => {
    if (!id) return;
    dispatch(fetchOfferById(id));
    return () => {
      dispatch(clearOfferDetails());
    };
  }, [dispatch, id]);

  const initialOffer = useMemo<DiscountOfferFormValues | undefined>(() => {
    if (!offerDetails) return undefined;
    return offerDtoToFormValues(offerDetails);
  }, [offerDetails]);

  const breadcrumbItems = [
    { label: t('sidebar.fees'), path: '/financial-management/fees?tab=discounts' },
    { label: t('fees.discounts.form.editTitle') },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="fees.discounts.form.editTitle" />

      <Card className="rounded-2xl" padding="lg">
        <AddEditDiscountOfferForm
          mode="edit"
          initialOffers={initialOffer ? [initialOffer] : undefined}
          isSubmitting={isLoadingDetails}
          onCancel={() => navigate('/financial-management/fees?tab=discounts')}
          onSubmit={async (offers: DiscountOfferFormValues[]) => {
            if (!id) return;
            if (!schoolBranchId) {
              showToast({ message: t('common.error'), type: 'error' });
              return;
            }

            const base = offerDetails;
            if (!base) {
              showToast({ message: t('common.error'), type: 'error' });
              return;
            }

            const o = offers[0];
            try {
              await dispatch(
                updateOffer({
                  id,
                  ...formValuesToOfferPayload(schoolBranchId, o, base),
                })
              )
                .unwrap()
                .then((res) => {
                  if (res.isSuccess) {
                    dispatch(
                      fetchOffers({ SchoolBranchId: schoolBranchId, PageIndex: 1, PageSize: 10 })
                    );
                    setShowPopupMessage({
                      show: true,
                      type: 'success',
                      message: 'fees.discounts.messages.editSuccess',
                      isRaw: false,
                    });
                  } else {
                    setShowPopupMessage({
                      show: true,
                      type: 'error',
                      message: 'common.error',
                      isRaw: false,
                    });
                  }
                });
            } catch (err) {
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
        navigateAfterClose={showPopupMessage.type === 'success' ? '/financial-management/fees?tab=discounts' : undefined}
      />
    </div>
  );
}
