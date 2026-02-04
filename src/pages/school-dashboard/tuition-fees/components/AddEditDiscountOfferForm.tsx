import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import FormField from '@/shared/components/FormField';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import CustomImage from '@/shared/components/CustomImage';
import IconButton from '@/shared/components/IconButton';
import ToggleSwitch from '@/shared/components/ToggleSwitch';
import CustomCheckbox from '@/shared/components/CustomCheckbox';
import CustomSelect from '@/shared/components/CustomSelect';
import PercentIcon from '@/assets/icons/Percent.svg';
import GreenPlusIcon from '@/assets/icons/GreenPlus.svg';
import { validateDiscountOffers } from '@/validations/discounts-offers-validations';
import {
  OfferApplyOn,
  OfferField,
  OfferOperator,
  type OfferField as OfferFieldType,
  type OfferOperator as OfferOperatorType,
} from '@/shared/enums/enums';

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
  matchAllConditions: boolean;
  applyOn: OfferApplyOn;
  field: OfferFieldType;
  operator: OfferOperatorType;
  value: any;
};

type AddEditDiscountOfferFormMode = 'add' | 'edit';

type AddEditDiscountOfferFormProps = {
  mode: AddEditDiscountOfferFormMode;
  initialOffers?: DiscountOfferFormValues[];
  onCancel: () => void;
  onSubmit: (offers: DiscountOfferFormValues[]) => void | Promise<void>;
  isSubmitting?: boolean;
};

const createEmptyOffer = (): DiscountOfferFormValues => ({
  nameAr: '',
  nameEn: '',
  discountType: 'value',
  discountValue: '',
  startDate: '',
  endDate: '',
  isActive: true,
  matchAllConditions: true,
  applyOn: OfferApplyOn.TuitionFees,
  field: OfferField.AlwaysTrue,
  operator: OfferOperator.Equals,
  value: 'true',
});

export default function AddEditDiscountOfferForm({
  mode,
  initialOffers,
  onCancel,
  onSubmit,
  isSubmitting,
}: AddEditDiscountOfferFormProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const offerFieldKeyMap = useMemo(
    () =>
      ({
        StudentId: 'student',
        GradeId: 'grade',
        StageId: 'stage',
        ClassroomId: 'classroom',
        IsNewStudent: 'isNewStudent',
        HasSibling: 'hasSibling',
        SiblingsCount: 'siblingsCount',
        Gender: 'gender',
        NationalityId: 'nationality',
        BirthYear: 'birthYear',
        TuitionAmount: 'tuitionAmount',
        ApplicationFeesAmount: 'applicationFeesAmount',
        RemainingAmount: 'remainingAmount',
        InstallmentsCount: 'installmentsCount',
        IsInstallment: 'isInstallment',
        PaidAmount: 'paidAmount',
        PaidServiceId: 'paidService',
        PaymentMethodId: 'paymentMethod',
        PaymentMethodType: 'paymentMethodType',
        PaymentDate: 'paymentDate',
        DueDate: 'dueDate',
        IsFullPayment: 'isFullPayment',
        IsEarlyPayment: 'isEarlyPayment',
        AlwaysTrue: 'alwaysTrue',
      }) as const,
    []
  );

  const offerFieldOptions = useMemo(() => {
    return (Object.entries(OfferField) as Array<[keyof typeof OfferField, number]>)
      .slice()
      .sort((a, b) => a[1] - b[1])
      .map(([enumKey, value]) => {
        const mappedKey = offerFieldKeyMap[enumKey];
        const label = mappedKey
          ? t(`fees.discounts.form.offerField.${mappedKey}`)
          : String(enumKey);

        return { label, value: String(value) };
      });
  }, [offerFieldKeyMap, t, i18n.language]);

  const offerOperatorKeyMap = useMemo(
    () =>
      ({
        Equals: 'equals',
        NotEquals: 'notEquals',
        GreaterThan: 'greaterThan',
        GreaterThanOrEqual: 'greaterThanOrEqual',
        LessThan: 'lessThan',
        LessThanOrEqual: 'lessThanOrEqual',
        In: 'in',
        NotIn: 'notIn',
        Between: 'between',
      }) as const,
    []
  );

  const offerOperatorOptions = useMemo(() => {
    return (Object.entries(OfferOperator) as Array<[keyof typeof OfferOperator, number]>)
      .slice()
      .sort((a, b) => a[1] - b[1])
      .map(([enumKey, value]) => {
        const mappedKey = offerOperatorKeyMap[enumKey];
        const label = mappedKey
          ? t(`fees.discounts.form.offerOperator.${mappedKey}`)
          : String(enumKey);

        return { label, value: String(value) };
      });
  }, [offerOperatorKeyMap, t, i18n.language]);

  const canAddMore = mode === 'add';

  const applyOnToFlags = (applyOn: OfferApplyOn) => {
    return {
      applicationFees: applyOn === OfferApplyOn.ApplicationFees || applyOn === OfferApplyOn.Both,
      tuitionFees: applyOn === OfferApplyOn.TuitionFees || applyOn === OfferApplyOn.Both,
    };
  };

  const applyOnFromFlags = (applicationFees: boolean, tuitionFees: boolean): OfferApplyOn => {
    if (applicationFees && tuitionFees) return OfferApplyOn.Both;
    if (applicationFees) return OfferApplyOn.ApplicationFees;
    return OfferApplyOn.TuitionFees;
  };

  const initialSignature = useMemo(() => JSON.stringify(initialOffers ?? []), [initialOffers]);

  const [offers, setOffers] = useState<DiscountOfferFormValues[]>(() => {
    if (mode === 'edit') {
      const first = initialOffers?.[0];
      return [first ? { ...createEmptyOffer(), ...first } : createEmptyOffer()];
    }

    return initialOffers && initialOffers.length > 0
      ? initialOffers.map((o) => ({ ...createEmptyOffer(), ...o }))
      : [createEmptyOffer()];
  });

  const [errors, setErrors] = useState<
    Record<number, Partial<Record<keyof DiscountOfferFormValues, string>>>
  >({});

  useEffect(() => {
    if (!initialOffers) return;

    if (mode === 'edit') {
      const first = initialOffers?.[0];
      setOffers([first ? { ...createEmptyOffer(), ...first } : createEmptyOffer()]);
    } else {
      setOffers(
        initialOffers.length > 0
          ? initialOffers.map((o) => ({ ...createEmptyOffer(), ...o }))
          : [createEmptyOffer()]
      );
    }

    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSignature, mode]);

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
    await onSubmit(mode === 'add' ? offers : offers.slice(0, 1));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4 rounded-lg border p-3 md:p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-medium text-black-700">
            {t('fees.discounts.form.sectionTitle')}
          </h3>

          {canAddMore && (
            <button
              type="button"
              onClick={addOffer}
              className="flex items-center gap-2"
              aria-label={t('fees.discounts.form.addAnother')}
            >
              <CustomImage src={GreenPlusIcon} className="h-9 w-9" alt="Add" />
            </button>
          )}
        </div>

        {offers.map((offer, idx) => {
          const offerErrors = errors[idx] ?? {};
          const canRemove = canAddMore && offers.length > 1;

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
                  <section>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <FormField
                        label={t('fees.discounts.form.nameArLabel')}
                        required
                        error={offerErrors.nameAr}
                      >
                        <Input
                          value={offer.nameAr}
                          onChange={(e) => updateOffer(idx, { nameAr: e.target.value })}
                          placeholder={t('fees.discounts.form.nameArPlaceholder')}
                        />
                      </FormField>

                      <FormField
                        label={t('fees.discounts.form.nameEnLabel')}
                        required
                        error={offerErrors.nameEn}
                      >
                        <Input
                          value={offer.nameEn}
                          onChange={(e) => updateOffer(idx, { nameEn: e.target.value })}
                          placeholder={t('fees.discounts.form.nameEnPlaceholder')}
                        />
                      </FormField>
                    </div>
                  </section>
                  <section>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <FormField label={t('fees.discounts.form.applyOnLabel')} required>
                        <div className="flex flex-wrap gap-4">
                          {(() => {
                            const flags = applyOnToFlags(offer.applyOn);

                            const setFlags = (
                              nextApplicationFees: boolean,
                              nextTuitionFees: boolean
                            ) => {
                              // Don’t allow unselecting both.
                              if (!nextApplicationFees && !nextTuitionFees) return;
                              updateOffer(idx, {
                                applyOn: applyOnFromFlags(nextApplicationFees, nextTuitionFees),
                              });
                            };

                            return (
                              <>
                                <CustomCheckbox
                                  label={t('fees.discounts.form.applyOn.applicationFees')}
                                  checked={flags.applicationFees}
                                  onChange={(checked) => setFlags(checked, flags.tuitionFees)}
                                />
                                <CustomCheckbox
                                  label={t('fees.discounts.form.applyOn.tuitionFees')}
                                  checked={flags.tuitionFees}
                                  onChange={(checked) => setFlags(flags.applicationFees, checked)}
                                />
                              </>
                            );
                          })()}
                        </div>
                      </FormField>
                    </div>
                  </section>

                  <section>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <FormField label={t('fees.discounts.form.discountTypeLabel')} required>
                        <div className="flex items-center gap-6">
                          <label className="flex cursor-pointer items-center gap-4">
                            <input
                              type="radio"
                              checked={offer.discountType === 'value'}
                              onChange={() => updateOffer(idx, { discountType: 'value' })}
                            />
                            <span className="text-base text-black-800">
                              {t('fees.discounts.form.typeValue')}
                            </span>
                          </label>

                          <label className="flex cursor-pointer items-center gap-4">
                            <input
                              type="radio"
                              checked={offer.discountType === 'percentage'}
                              onChange={() => updateOffer(idx, { discountType: 'percentage' })}
                            />
                            <span className="text-base text-black-800">
                              {t('fees.discounts.form.typePercentage')}
                            </span>
                          </label>
                        </div>
                      </FormField>

                      <FormField
                        label={t('fees.discounts.form.discountValueLabel')}
                        required
                        error={offerErrors.discountValue}
                      >
                        <Input
                          type="number"
                          min={0}
                          max={offer.discountType === 'percentage' ? 100 : undefined}
                          value={offer.discountValue}
                          onChange={(e) => updateOffer(idx, { discountValue: e.target.value })}
                          placeholder={t('fees.discounts.form.discountValuePlaceholder')}
                          icon={valueIcon}
                          className={
                            offer.discountType === 'percentage'
                              ? isRTL
                                ? 'pl-10 pr-4'
                                : 'pl-4 pr-10'
                              : 'pl-4 pr-4'
                          }
                        />
                      </FormField>
                    </div>
                  </section>

                  <section>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <FormField
                        label={t('fees.discounts.form.startDateLabel')}
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

                      <FormField
                        label={t('fees.discounts.form.endDateLabel')}
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
                    </div>
                  </section>

                  <div className="flex flex-col items-start gap-2">
                    <div className="flex flex-col items-start gap-1">
                      <div className="required text-base font-normal text-black-800">
                        {t('fees.discounts.form.statusLabel')}
                      </div>
                      <div className="text-base font-normal text-gray-500">
                        {t('fees.discounts.form.statusHint')}
                      </div>
                    </div>

                    <ToggleSwitch
                      checked={offer.isActive}
                      onChange={(next) => updateOffer(idx, { isActive: next })}
                    />
                  </div>

                  <div className="flex flex-col items-start gap-2">
                    <div className="flex flex-col items-start gap-1">
                      <div className="required text-base font-normal text-black-800">
                        {t('fees.discounts.form.matchAllConditions')}
                      </div>
                    </div>

                    <ToggleSwitch
                      checked={offer.matchAllConditions}
                      onChange={(next) => updateOffer(idx, { matchAllConditions: next })}
                    />
                  </div>

                  <section>
                    <div className="flex items-start justify-between gap-2">
                      <div className="grid flex-1 grid-cols-1 gap-5 md:grid-cols-2">
                        <FormField
                          label={t('fees.discounts.form.conditionOperatorLabel')}
                          required
                          error={offerErrors.operator}
                        >
                          <CustomSelect
                            value={String(offer.operator)}
                            onChange={(value) =>
                              updateOffer(idx, {
                                operator: Number(value) as OfferOperatorType,
                              })
                            }
                            options={offerOperatorOptions}
                            placeholder={t('common.choose')}
                            error={!!offerErrors.operator}
                          />
                        </FormField>

                        <FormField
                          label={t('fees.discounts.form.conditionFieldLabel')}
                          required
                          error={offerErrors.field}
                        >
                          <CustomSelect
                            value={String(offer.field)}
                            onChange={(value) =>
                              updateOffer(idx, {
                                field: Number(value) as OfferFieldType,
                              })
                            }
                            options={offerFieldOptions}
                            placeholder={t('common.choose')}
                            error={!!offerErrors.field}
                          />
                        </FormField>

                        <FormField
                          label={t('fees.discounts.form.valueLabel')}
                          required
                          error={offerErrors.value}
                        >
                          <Input
                            value={offer.value === null || offer.value === undefined ? '' : String(offer.value)}
                            onChange={(e) => updateOffer(idx, { value: e.target.value })}
                            placeholder={t('common.enterValue')}
                          />
                        </FormField>
                      </div>
                      {canAddMore && (
                        <button
                          type="button"
                          onClick={addOffer}
                          className="flex items-center gap-2"
                          aria-label={t('fees.discounts.form.addAnother')}
                        >
                          <CustomImage src={GreenPlusIcon} className="h-7 w-7" alt="Add" />
                        </button>
                      )}
                    </div>
                  </section>
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
      </div>

      <div className="flex flex-row-reverse gap-3 pt-2">
        <Button onClick={handleSubmit} variant="primary" disabled={!!isSubmitting}>
          {mode === 'add' ? t('common.add') : t('common.save')}
        </Button>
        <Button onClick={onCancel} variant="outline" type="button" disabled={!!isSubmitting}>
          {t('common.cancel')}
        </Button>
      </div>
    </div>
  );
}
