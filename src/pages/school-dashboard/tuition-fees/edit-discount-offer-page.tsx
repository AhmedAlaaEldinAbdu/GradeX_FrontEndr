import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import Card from '@/shared/components/Card';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { tokenManager } from '@/lib/auth';
import {
  clearOfferDetails,
  fetchOfferById,
  updateOffer,
  fetchOffers,
} from '@/redux/features/offers/offersSlice';
import { useToast } from '@/shared/context/ToastContext';
import AddEditDiscountOfferForm, {
  type DiscountOfferFormValues,
} from './components/AddEditDiscountOfferForm';
import { offerDtoToFormValues, formValuesToOfferPayload } from './utils/discount-offer-mappers';

export default function EditDiscountOfferPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

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
    { label: t('sidebar.fees'), path: '/fees?tab=discounts' },
    { label: t('fees.discounts.modal.editTitle') },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="fees.discounts.modal.editTitle" />

      <Card className="rounded-2xl" padding="lg">
        <AddEditDiscountOfferForm
          mode="edit"
          initialOffers={initialOffer ? [initialOffer] : undefined}
          isSubmitting={isLoadingDetails}
          onCancel={() => navigate('/fees?tab=discounts')}
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
            await dispatch(
              updateOffer({
                id,
                ...formValuesToOfferPayload(schoolBranchId, o, base),
              })
            ).unwrap();

            showToast({ message: t('common.success'), type: 'success' });
            dispatch(fetchOffers({ SchoolBranchId: schoolBranchId, PageIndex: 1, PageSize: 10 }));
            navigate('/fees?tab=discounts');
          }}
        />
      </Card>
    </div>
  );
}
