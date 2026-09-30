import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
// import Card from '@/shared/components/Card';
import FormField from '@/shared/components/FormField';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import CustomImage from '@/shared/components/CustomImage';
import ToggleSwitch from '@/shared/components/ToggleSwitch';
import CustomSelect from '@/shared/components/CustomSelect';
import PercentIcon from '@/assets/icons/Percent.svg';
// import GreenPlusIcon from '@/assets/icons/GreenPlus.svg';
import { validateDiscountOffers } from '@/validations/discounts-offers-validations';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';
import {
  OfferApplyOn,
  OfferField,
  OfferOperator,
  type OfferField as OfferFieldType,
  type OfferOperator as OfferOperatorType,
} from '@/shared/enums/enums';

export type DiscountType = 'value' | 'percentage';

export type DiscountOfferConditionFormValue = {
  field: OfferFieldType;
  operator: OfferOperatorType;
  value: string;
};

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
  conditions: DiscountOfferConditionFormValue[];
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
  conditions: [
    {
      field: OfferField.AlwaysTrue,
      operator: OfferOperator.Equals,
      value: 'true',
    },
  ],
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
    const allowedFields: Array<keyof typeof OfferField> = [
      'HasSibling',
      'IsFullPayment',
      'IsEarlyPayment',
      'AlwaysTrue',
    ];

    return (Object.entries(OfferField) as Array<[keyof typeof OfferField, number]>)
      .slice()
      .filter(([enumKey]) => allowedFields.includes(enumKey))
      .sort((a, b) => a[1] - b[1])
      .map(([enumKey, value]) => {
        const mappedKey = offerFieldKeyMap[enumKey];
        const label = mappedKey
          ? t(`fees.discounts.form.offerField.${mappedKey}`)
          : String(enumKey);

        return { label, value: String(value) };
      });
  }, [offerFieldKeyMap, t, i18n.language]);

  const normalizeOffer = (o: DiscountOfferFormValues): DiscountOfferFormValues => {
    if (Array.isArray(o.conditions) && o.conditions.length > 0) return o;
    return { ...o, conditions: createEmptyOffer().conditions };
  };

  const initialSignature = useMemo(() => JSON.stringify(initialOffers ?? []), [initialOffers]);

  const [offer, setOffer] = useState<DiscountOfferFormValues>(() => {
    const first = initialOffers?.[0];
    return normalizeOffer(first ? { ...createEmptyOffer(), ...first } : createEmptyOffer());
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const scrollToFirstError = useScrollToFirstError();

  useEffect(() => {
    if (!initialOffers) return;

    const first = initialOffers?.[0];
    setOffer(normalizeOffer(first ? { ...createEmptyOffer(), ...first } : createEmptyOffer()));
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSignature, mode]);

  const updateOffer = (partial: Partial<DiscountOfferFormValues>) => {
    setOffer((prev) => ({ ...prev, ...partial }));
  };

  const updateCondition = (
    conditionIndex: number,
    partial: Partial<DiscountOfferConditionFormValue>
  ) => {
    setOffer((prev) => {
      const conditions = (prev.conditions ?? []).map((c, ci) =>
        ci === conditionIndex ? { ...c, ...partial } : c
      );
      return normalizeOffer({ ...prev, conditions });
    });
  };

  const handleSubmit = async () => {
    const offerToSubmit = {
      ...offer,
      applyOn: OfferApplyOn.TuitionFees,
      matchAllConditions: true,
    };

    const normalizedForValidation = {
      ...offerToSubmit,
      discountValue: Number(offerToSubmit.discountValue),
    };

    const result = await validateDiscountOffers([normalizedForValidation], false);

    if (!result.isValid) {
      const fieldErrors = result.errorsByIndex[0] ?? {};
      setErrors(fieldErrors);
      scrollToFirstError(fieldErrors);
      return;
    }

    setErrors({});
    await onSubmit([offerToSubmit]);
  };

  return (
    <div className="space-y-4">
      {/* <div className="space-y-4 rounded-lg border p-3 md:p-5"> */}
      {/* <div className="flex items-center justify-between">
          <h3 className="text-2xl font-medium text-black-700">
            {t('fees.discounts.form.sectionTitle')}
          </h3>

          {canAddMoreOffers && (
            <button
              type="button"
              onClick={addOffer}
              className="flex items-center gap-2"
              aria-label={t('fees.discounts.form.addAnother')}
            >
              <CustomImage src={GreenPlusIcon} className="h-9 w-9" alt="Add" />
            </button>
          )}
        </div> */}

      {(() => {
        const conditionIndex = 0;
        const condition = offer.conditions?.[conditionIndex] ?? createEmptyOffer().conditions[0];
        const fieldErr = errors[`conditions.${conditionIndex}.field`];

        const valueIcon =
          offer.discountType === 'percentage' ? (
            <span>
              <CustomImage src={PercentIcon} alt="Percent" />
            </span>
          ) : (
            <span></span>
          );

        return (
          <div>
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-4">
                <section>
                  <div className="grid grid-cols-1 gap-5">
                    <FormField
                      label={t('fees.discounts.form.conditionFieldLabel')}
                      required
                      error={fieldErr}
                    >
                      <CustomSelect
                        value={String(condition.field)}
                        onChange={(value) =>
                          updateCondition(conditionIndex, {
                            field: Number(value) as OfferFieldType,
                          })
                        }
                        options={offerFieldOptions}
                        placeholder={t('common.choose')}
                        error={!!fieldErr}
                      />
                    </FormField>
                  </div>
                </section>
                <section>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <FormField
                      label={t('fees.discounts.form.nameArLabel')}
                      required
                      error={errors.nameAr}
                      name="nameAr"
                    >
                      <Input
                        value={offer.nameAr}
                        onChange={(e) => updateOffer({ nameAr: e.target.value })}
                        placeholder={t('fees.discounts.form.nameArPlaceholder')}
                      />
                    </FormField>

                    <FormField
                      label={t('fees.discounts.form.nameEnLabel')}
                      required
                      error={errors.nameEn}
                      name="nameEn"
                    >
                      <Input
                        value={offer.nameEn}
                        onChange={(e) => updateOffer({ nameEn: e.target.value })}
                        placeholder={t('fees.discounts.form.nameEnPlaceholder')}
                      />
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
                            onChange={() => updateOffer({ discountType: 'value' })}
                          />
                          <span className="text-base text-black-800">
                            {t('fees.discounts.form.typeValue')}
                          </span>
                        </label>

                        <label className="flex cursor-pointer items-center gap-4">
                          <input
                            type="radio"
                            checked={offer.discountType === 'percentage'}
                            onChange={() => updateOffer({ discountType: 'percentage' })}
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
                      error={errors.discountValue}
                      name="discountValue"
                    >
                      <Input
                        type="number"
                        min={0}
                        max={offer.discountType === 'percentage' ? 100 : undefined}
                        value={offer.discountValue}
                        onChange={(e) => updateOffer({ discountValue: e.target.value })}
                        placeholder={t('fees.discounts.form.discountValuePlaceholder')}
                        icon={valueIcon}
                        className={
                          offer.discountType === 'percentage'
                            ? isRTL
                              ? 'pr-4 pl-10'
                              : 'pr-10 pl-4'
                            : 'pr-4 pl-4'
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
                      error={errors.startDate}
                      name="startDate"
                    >
                      <Input
                        type="date"
                        value={offer.startDate}
                        onChange={(e) => updateOffer({ startDate: e.target.value })}
                        placeholder={t('common.chooseDate')}
                      />
                    </FormField>

                    <FormField
                      label={t('fees.discounts.form.endDateLabel')}
                      required
                      error={errors.endDate}
                      name="endDate"
                    >
                      <Input
                        type="date"
                        value={offer.endDate}
                        onChange={(e) => updateOffer({ endDate: e.target.value })}
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
                    onChange={(next) => updateOffer({ isActive: next })}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      {/* </div> */}

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
