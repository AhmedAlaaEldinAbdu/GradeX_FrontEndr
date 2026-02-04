import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import Card from '@/shared/components/Card';
import { useAppDispatch } from '@/hooks/useRedux';
import { tokenManager } from '@/lib/auth';
import { createOffer, fetchOffers } from '@/redux/features/offers/offersSlice';
import { useToast } from '@/shared/context/ToastContext';
import AddEditDiscountOfferForm, {
  type DiscountOfferFormValues,
} from './components/AddEditDiscountOfferForm';
import { formValuesToOfferPayload } from './utils/discount-offer-mappers';

export default function AddDiscountOfferPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const schoolBranchId = tokenManager.getUserData()?.schoolBranchId ?? '';

  const breadcrumbItems = [
    { label: t('sidebar.fees'), path: '/fees?tab=discounts' },
    { label: t('fees.discounts.form.addTitle') },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="fees.discounts.form.addTitle" />

      <Card className="rounded-2xl" padding="lg">
        <AddEditDiscountOfferForm
          mode="add"
          onCancel={() => navigate('/fees?tab=discounts')}
          onSubmit={async (offers: DiscountOfferFormValues[]) => {
            if (!schoolBranchId) {
              showToast({ message: t('common.error'), type: 'error' });
              return;
            }

            await Promise.all(
              offers.map((o) =>
                dispatch(createOffer(formValuesToOfferPayload(schoolBranchId, o))).unwrap()
              )
            );

            showToast({ message: t('common.success'), type: 'success' });
            dispatch(fetchOffers({ SchoolBranchId: schoolBranchId, PageIndex: 1, PageSize: 10 }));
            navigate('/fees?tab=discounts');
          }}
        />
      </Card>
    </div>
  );
}
