import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/shared/popups/Modal';
import Card from '@/shared/components/Card';
import FormField from '@/shared/components/FormField';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import CustomImage from '@/shared/components/CustomImage';
import IconButton from '@/shared/components/IconButton';
import PercentIcon from '@/assets/icons/Percent.svg';
import { validateDiscountOffers } from '@/validations/discounts-offers-validations';
import GreenPlusIcon from '@/assets/icons/GreenPlus.svg';

export type DiscountType = 'value' | 'percentage';

export type DiscountOfferFormValues = {
  id?: string;
  nameAr: string;
  nameEn: string;
  discountType: DiscountType;
  discountValue: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

type AddEditDiscountOfferPopupMode = 'add' | 'edit';

type AddEditDiscountOfferPopupProps = {
  open: boolean;
  mode: AddEditDiscountOfferPopupMode;
  initialOffer?: DiscountOfferFormValues;
  onClose: () => void;
  onSubmit: (offers: DiscountOfferFormValues[]) => void;
};

const createEmptyOffer = (): DiscountOfferFormValues => ({
  nameAr: '',
  nameEn: '',
  discountType: 'value',
  discountValue: '',
  startDate: '',
  endDate: '',
  isActive: true,
});

export default function AddEditDiscountOfferPopup({
  open,
  mode,
  initialOffer,
  onClose,
  onSubmit,
}: AddEditDiscountOfferPopupProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [offers, setOffers] = useState<DiscountOfferFormValues[]>([createEmptyOffer()]);
  const [errors, setErrors] = useState<
    Record<number, Partial<Record<keyof DiscountOfferFormValues, string>>>
  >({});

  const canAddMore = mode === 'add';
  const canRemove = canAddMore && offers.length > 1;

  const title = useMemo(() => {
    return mode === 'add'
      ? t('fees.discounts.modal.addTitle')
      : t('fees.discounts.modal.editTitle');
  }, [mode, t]);

  useEffect(() => {
    if (!open) return;

    if (mode === 'edit' && initialOffer) {
      setOffers([{ ...createEmptyOffer(), ...initialOffer }]);
    } else {
      setOffers([createEmptyOffer()]);
    }

    setErrors({});
  }, [open, mode, initialOffer]);

  const updateOffer = (index: number, partial: Partial<DiscountOfferFormValues>) => {
    setOffers((prev) => prev.map((o, i) => (i === index ? { ...o, ...partial } : o)));
  };

  const addOffer = () => setOffers((prev) => [...prev, createEmptyOffer()]);

  const removeOffer = (index: number) => {
    setOffers((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const handleSubmit = async () => {
    const allowMultiple = mode === 'add';
    const normalizedForValidation = offers.map((o) => ({
      ...o,
      discountValue: Number(o.discountValue),
    }));

    const result = await validateDiscountOffers(normalizedForValidation, allowMultiple);

    if (!result.isValid) {
      setErrors(
        Object.fromEntries(
          Object.entries(result.errorsByIndex).map(([idx, fieldErrors]) => [
            Number(idx),
            fieldErrors as Partial<Record<keyof DiscountOfferFormValues, string>>,
          ])
        )
      );
      return;
    }

    setErrors({});
    onSubmit(mode === 'add' ? offers : offers.slice(0, 1));
  };

  return (
    <Modal isOpen={open} onClose={onClose} title={title} size="md" contentClassName="p-4 md:p-6">
      <div className="space-y-4 rounded-lg border p-3 md:p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-black-700">
            {t('fees.discounts.modal.sectionTitle')}
          </h3>

          {canAddMore && (
            <button
              type="button"
              onClick={addOffer}
              className="flex items-center gap-2"
              aria-label={t('fees.discounts.modal.addAnother')}
            >
              <CustomImage src={GreenPlusIcon} className="h-9 w-9" alt="Add" />
            </button>
          )}
        </div>

        {offers.map((offer, idx) => {
          const offerErrors = errors[idx] ?? {};
          const valueIcon =
            offer.discountType === 'percentage' ? (
              <span>
                <CustomImage src={PercentIcon} alt="Percent" />
              </span>
            ) : (
              <span></span>
            );

          return (
            <Card key={idx} className="rounded-2xl" padding="lg">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-4">
                  <FormField
                    label={t('fees.discounts.modal.nameArLabel')}
                    required
                    error={offerErrors.nameAr}
                  >
                    <Input
                      value={offer.nameAr}
                      onChange={(e) => updateOffer(idx, { nameAr: e.target.value })}
                      placeholder={t('fees.discounts.modal.nameArPlaceholder')}
                    />
                  </FormField>

                  <FormField
                    label={t('fees.discounts.modal.nameEnLabel')}
                    required
                    error={offerErrors.nameEn}
                  >
                    <Input
                      value={offer.nameEn}
                      onChange={(e) => updateOffer(idx, { nameEn: e.target.value })}
                      placeholder={t('fees.discounts.modal.nameEnPlaceholder')}
                    />
                  </FormField>

                  <FormField label={t('fees.discounts.modal.discountTypeLabel')} required>
                    <div className="flex items-center gap-6">
                      <label className="flex cursor-pointer items-center gap-4">
                        <input
                          type="radio"
                          checked={offer.discountType === 'value'}
                          onChange={() => updateOffer(idx, { discountType: 'value' })}
                        />
                        <span className="text-base text-black-900">
                          {t('fees.discounts.modal.typeValue')}
                        </span>
                      </label>

                      <label className="flex cursor-pointer items-center gap-4">
                        <input
                          type="radio"
                          checked={offer.discountType === 'percentage'}
                          onChange={() => updateOffer(idx, { discountType: 'percentage' })}
                        />
                        <span className="text-base text-black-900">
                          {t('fees.discounts.modal.typePercentage')}
                        </span>
                      </label>
                    </div>
                  </FormField>

                  <FormField
                    label={t('fees.discounts.modal.discountValueLabel')}
                    required
                    error={offerErrors.discountValue}
                  >
                    <Input
                      type="number"
                      min={0}
                      max={offer.discountType === 'percentage' ? 100 : undefined}
                      value={offer.discountValue}
                      onChange={(e) => updateOffer(idx, { discountValue: e.target.value })}
                      placeholder={t('fees.discounts.modal.discountValuePlaceholder')}
                      icon={valueIcon}
                      className={isRTL ? 'pl-10 pr-4' : 'pl-4 pr-10'}
                    />
                  </FormField>

                  <FormField
                    label={t('fees.discounts.modal.endDateLabel')}
                    required
                    error={offerErrors.endDate}
                  >
                    <Input
                      type="date"
                      value={offer.endDate}
                      onChange={(e) => updateOffer(idx, { endDate: e.target.value })}
                      placeholder={t('common.chooseDate')}
                    />
                  </FormField>

                  <FormField
                    label={t('fees.discounts.modal.startDateLabel')}
                    required
                    error={offerErrors.startDate}
                  >
                    <Input
                      type="date"
                      value={offer.startDate}
                      onChange={(e) => updateOffer(idx, { startDate: e.target.value })}
                      placeholder={t('common.chooseDate')}
                    />
                  </FormField>

                  <div className="flex flex-col items-start gap-2">
                    <div className="flex flex-col items-start gap-1">
                      <div className="required text-base font-normal text-black-800">
                        {t('fees.discounts.modal.statusLabel')}
                      </div>
                      <div className="text-base font-normal text-gray-500">
                        {t('fees.discounts.modal.statusHint')}
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={offer.isActive}
                      onClick={() => updateOffer(idx, { isActive: !offer.isActive })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                        offer.isActive ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          offer.isActive ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {canRemove ? (
                  <div>
                    <IconButton
                      status="delete"
                      variant="danger"
                      ariaLabel={t('actions.delete')}
                      onClick={() => removeOffer(idx)}
                    />
                  </div>
                ) : (
                  <div className="h-8 w-8"></div>
                )}
              </div>
            </Card>
          );
        })}

        <div className="flex flex-row-reverse gap-3 pt-2">
          <Button onClick={handleSubmit} variant="primary">
            {mode === 'add' ? t('common.add') : t('common.save')}
          </Button>
          <Button onClick={onClose} variant="outline" type="button">
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
