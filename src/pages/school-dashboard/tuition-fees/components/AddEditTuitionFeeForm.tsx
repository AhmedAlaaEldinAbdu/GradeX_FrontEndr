import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import FormField from '@/shared/components/FormField';
import CustomSelect, { type CustomSelectOption } from '@/shared/components/CustomSelect';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import IconButton from '@/shared/components/IconButton';
import CustomImage from '@/shared/components/CustomImage';
import CustomCheckbox from '@/shared/components/CustomCheckbox';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { getEducationalStages } from '@/redux/features/educational-stages/educationalStagesSlice';
import { fetchLKPaymentMethods } from '@/redux/features/lookups/lookupsSlice';
import GreenPlusIcon from '@/assets/icons/GreenPlus.svg';

type ServiceRow = {
  id: string;
  nameAr: string;
  nameEn: string;
};

type PaidServiceRow = ServiceRow & {
  amount: string;
};

type InstallmentRow = {
  id: string;
  dueDate: string;
  percentage: string;
};

type InstallmentPlan = {
  id: string;
  paymentsCount: number;
  dueMode: 'equal' | 'ratio';
  rows: InstallmentRow[];
};

export type TuitionFeeFormValues = {
  educationalStageId: string;
  tuitionAmount: string;
  includedServices: ServiceRow[];
  paidServices: PaidServiceRow[];
  paymentMethodIds: string[];
  installmentPlans: InstallmentPlan[];
};

type TuitionFeeFormProps = {
  schoolBranchId: string;
  mode?: 'add' | 'edit';
  initialValues?: Partial<TuitionFeeFormValues>;
  /** When changed, the form re-initializes from `initialValues` */
  formKey?: string | number;
  submitLabel?: string;
  onCancel?: () => void;
  onSubmit?: (values: TuitionFeeFormValues) => void | Promise<void>;
};

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createServiceRow = (): ServiceRow => ({ id: createId(), nameAr: '', nameEn: '' });
const createPaidServiceRow = (): PaidServiceRow => ({
  id: createId(),
  nameAr: '',
  nameEn: '',
  amount: '',
});
const createInstallmentRow = (): InstallmentRow => ({
  id: createId(),
  dueDate: '',
  percentage: '',
});

const createInstallmentPlan = (): InstallmentPlan => ({
  id: createId(),
  paymentsCount: 3,
  dueMode: 'ratio',
  rows: [createInstallmentRow(), createInstallmentRow(), createInstallmentRow()],
});

const normalizeInstallmentRows = (plan: InstallmentPlan): InstallmentPlan => {
  if (plan.dueMode === 'equal') {
    return {
      ...plan,
      rows: [plan.rows?.[0] ?? createInstallmentRow()],
    };
  }

  const safe =
    Number.isFinite(plan.paymentsCount) && plan.paymentsCount > 0 ? plan.paymentsCount : 1;
  const nextRows = Array.from(
    { length: safe },
    (_, idx) => plan.rows[idx] ?? createInstallmentRow()
  );
  return { ...plan, paymentsCount: safe, rows: nextRows };
};

const buildInitialValues = (initial?: Partial<TuitionFeeFormValues>): TuitionFeeFormValues => {
  const includedServices =
    initial?.includedServices && initial.includedServices.length > 0
      ? initial.includedServices.map((s) => ({
          id: s.id || createId(),
          nameAr: s.nameAr ?? '',
          nameEn: s.nameEn ?? '',
        }))
      : [createServiceRow()];

  const paidServices =
    initial?.paidServices && initial.paidServices.length > 0
      ? initial.paidServices.map((s) => ({
          id: s.id || createId(),
          nameAr: s.nameAr ?? '',
          nameEn: s.nameEn ?? '',
          amount: (s as PaidServiceRow).amount ?? '',
        }))
      : [createPaidServiceRow()];

  const paymentMethodIds = Array.isArray(initial?.paymentMethodIds)
    ? initial?.paymentMethodIds
    : [];

  const installmentPlans =
    initial?.installmentPlans && initial.installmentPlans.length > 0
      ? initial.installmentPlans.map((p) => {
          const paymentsCount =
            Number.isFinite(p.paymentsCount) && (p.paymentsCount ?? 0) > 0
              ? Math.floor(p.paymentsCount)
              : 1;
          const dueMode: InstallmentPlan['dueMode'] = p.dueMode === 'equal' ? 'equal' : 'ratio';
          const rows = Array.from({ length: paymentsCount }, (_, idx) => {
            const row = p.rows?.[idx];
            return {
              id: row?.id || createId(),
              dueDate: row?.dueDate ?? '',
              percentage: row?.percentage ?? '',
            };
          });

          return {
            id: p.id || createId(),
            paymentsCount,
            dueMode,
            rows,
          };
        })
      : [createInstallmentPlan()];

  return {
    educationalStageId: initial?.educationalStageId ?? '',
    tuitionAmount: initial?.tuitionAmount ?? '',
    includedServices,
    paidServices,
    paymentMethodIds,
    installmentPlans,
  };
};

export default function AddEditTuitionFeeForm({
  schoolBranchId,
  mode = 'add',
  initialValues,
  formKey,
  submitLabel,
  onCancel,
  onSubmit,
}: TuitionFeeFormProps) {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';

  const { educationalStages, isLoading: isEducationalStagesLoading } = useAppSelector(
    (state) => state.educationalStages
  );

  const { lkPaymentMethods, isLoadingLKPaymentMethods } = useAppSelector((state) => state.lookups);

  useEffect(() => {
    if (educationalStages.length > 0) return;
    dispatch(getEducationalStages({ pageIndex: 1, pageSize: 10000, schoolBranchId }));
  }, [dispatch, educationalStages.length, schoolBranchId]);

  useEffect(() => {
    if (lkPaymentMethods.length > 0) return;
    dispatch(fetchLKPaymentMethods({ params: { PageIndex: 1, PageSize: 10000 } }));
  }, [dispatch, lkPaymentMethods.length]);

  const educationalStageOptions = useMemo<CustomSelectOption[]>(
    () =>
      educationalStages.map((stage) => ({
        value: stage.id,
        label: (currentLang === 'ar' ? stage.nameAr : stage.nameEn) || stage.nameAr || stage.nameEn,
      })),
    [educationalStages, currentLang]
  );

  const initialSignature = useMemo(() => JSON.stringify(initialValues ?? {}), [initialValues]);

  const [values, setValues] = useState<TuitionFeeFormValues>(() =>
    buildInitialValues(initialValues)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [didAutoSelectPaymentMethods, setDidAutoSelectPaymentMethods] = useState(false);

  const hasEqualInstallmentPlan = values.installmentPlans.some((p) => p.dueMode === 'equal');

  useEffect(() => {
    if (formKey === undefined) return;
    setValues(buildInitialValues(initialValues));
    setDidAutoSelectPaymentMethods(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formKey, initialSignature]);

  useEffect(() => {
    if (didAutoSelectPaymentMethods) return;
    if (values.paymentMethodIds.length > 0) return;
    if (lkPaymentMethods.length === 0) return;
    if (
      Array.isArray(initialValues?.paymentMethodIds) &&
      initialValues?.paymentMethodIds.length > 0
    )
      return;

    setValues((prev) => ({ ...prev, paymentMethodIds: lkPaymentMethods.map((m) => m.id) }));
    setDidAutoSelectPaymentMethods(true);
  }, [
    didAutoSelectPaymentMethods,
    initialValues?.paymentMethodIds,
    lkPaymentMethods,
    values.paymentMethodIds.length,
  ]);

  const patch = (partial: Partial<TuitionFeeFormValues>) =>
    setValues((prev) => ({ ...prev, ...partial }));

  const updateIncluded = (id: string, partial: Partial<ServiceRow>) => {
    setValues((prev) => ({
      ...prev,
      includedServices: prev.includedServices.map((x) => (x.id === id ? { ...x, ...partial } : x)),
    }));
  };

  const updatePaid = (id: string, partial: Partial<PaidServiceRow>) => {
    setValues((prev) => ({
      ...prev,
      paidServices: prev.paidServices.map((x) => (x.id === id ? { ...x, ...partial } : x)),
    }));
  };

  const addIncluded = () =>
    setValues((prev) => ({
      ...prev,
      includedServices: [...prev.includedServices, createServiceRow()],
    }));
  const removeIncluded = (id: string) =>
    setValues((prev) => ({
      ...prev,
      includedServices:
        prev.includedServices.length > 1
          ? prev.includedServices.filter((x) => x.id !== id)
          : prev.includedServices,
    }));

  const addPaid = () =>
    setValues((prev) => ({
      ...prev,
      paidServices: [...prev.paidServices, createPaidServiceRow()],
    }));
  const removePaid = (id: string) =>
    setValues((prev) => ({
      ...prev,
      paidServices:
        prev.paidServices.length > 1
          ? prev.paidServices.filter((x) => x.id !== id)
          : prev.paidServices,
    }));

  const addPlan = () =>
    setValues((prev) => {
      // When using equal payments, only one plan is allowed.
      if (prev.installmentPlans.some((p) => p.dueMode === 'equal')) return prev;
      return {
        ...prev,
        installmentPlans: [...prev.installmentPlans, createInstallmentPlan()],
      };
    });
  const removePlan = (id: string) =>
    setValues((prev) => ({
      ...prev,
      installmentPlans:
        prev.installmentPlans.length > 1
          ? prev.installmentPlans.filter((p) => p.id !== id)
          : prev.installmentPlans,
    }));

  const updatePlan = (id: string, partial: Partial<InstallmentPlan>) => {
    setValues((prev) => {
      const updatedPlans = prev.installmentPlans.map((p) =>
        p.id === id ? normalizeInstallmentRows({ ...p, ...partial }) : p
      );

      // If user chooses equal payments, keep only one plan.
      if (partial.dueMode === 'equal') {
        const selected = updatedPlans.find((p) => p.id === id);
        return {
          ...prev,
          installmentPlans: selected ? [selected] : updatedPlans.slice(0, 1),
        };
      }

      return {
        ...prev,
        installmentPlans: updatedPlans,
      };
    });
  };

  const updatePlanRow = (planId: string, rowId: string, partial: Partial<InstallmentRow>) => {
    setValues((prev) => ({
      ...prev,
      installmentPlans: prev.installmentPlans.map((p) => {
        if (p.id !== planId) return p;
        return { ...p, rows: p.rows.map((r) => (r.id === rowId ? { ...r, ...partial } : r)) };
      }),
    }));
  };

  const handleChangePaymentsCount = (plan: InstallmentPlan, count: number) => {
    const safe = Number.isFinite(count) && count > 0 ? Math.floor(count) : 1;

    // In equal mode, the due date + percentage UI should be a single row.
    if (plan.dueMode === 'equal') {
      updatePlan(plan.id, {
        paymentsCount: safe,
        rows: [plan.rows?.[0] ?? createInstallmentRow()],
      });
      return;
    }

    const nextRows = Array.from(
      { length: safe },
      (_, idx) => plan.rows[idx] ?? createInstallmentRow()
    );
    updatePlan(plan.id, { paymentsCount: safe, rows: nextRows });
  };

  const handleSubmit = async () => {
    if (!onSubmit) return;
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitText = submitLabel ?? t(mode === 'edit' ? 'common.save' : 'common.add');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label={t('fees.tuition.form.stageLabel')} required>
          <CustomSelect
            value={values.educationalStageId}
            onChange={(value) =>
              patch({ educationalStageId: Array.isArray(value) ? (value[0] ?? '') : value })
            }
            options={educationalStageOptions}
            placeholder={t('fees.tuition.form.stagePlaceholder')}
            disabled={isEducationalStagesLoading}
          />
        </FormField>

        <FormField label={t('fees.tuition.form.tuitionAmountLabel')} required>
          <Input
            type="number"
            min={0}
            value={values.tuitionAmount}
            onChange={(e) => patch({ tuitionAmount: e.target.value })}
            placeholder={t('fees.tuition.form.tuitionAmountPlaceholder')}
          />
        </FormField>
      </div>

      <Card className="rounded-2xl" padding="lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-2xl font-medium text-black-700">{t('fees.servicesIncluded')}</h3>
          <button type="button" onClick={addIncluded} className="flex items-center gap-2">
            <CustomImage src={GreenPlusIcon} className="h-8 w-8" alt="Add" />
          </button>
        </div>

        <div className="space-y-4">
          {values.includedServices.map((row) => (
            <div key={row.id} className="flex items-start">
              <div className="grid flex-grow grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label={t('fees.tuition.form.serviceArLabel')} required>
                  <Input
                    value={row.nameAr}
                    onChange={(e) => updateIncluded(row.id, { nameAr: e.target.value })}
                    placeholder={t('fees.tuition.form.serviceArPlaceholder')}
                  />
                </FormField>
                <FormField label={t('fees.tuition.form.serviceEnLabel')} required>
                  <Input
                    value={row.nameEn}
                    onChange={(e) => updateIncluded(row.id, { nameEn: e.target.value })}
                    placeholder={t('fees.tuition.form.serviceEnPlaceholder')}
                  />
                </FormField>
              </div>

              <div className="flex justify-end">
                {values.includedServices.length > 1 ? (
                  <IconButton
                    status="delete"
                    variant="danger"
                    ariaLabel="Delete"
                    onClick={() => removeIncluded(row.id)}
                  />
                ) : (
                  <div className="h-8 w-8"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="rounded-2xl" padding="lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-2xl font-medium text-black-700">{t('fees.paidServices')}</h3>
          <button type="button" onClick={addPaid} className="flex items-center gap-2">
            <CustomImage src={GreenPlusIcon} className="h-8 w-8" alt="Add" />
          </button>
        </div>

        <div className="space-y-8">
          {values.paidServices.map((row) => (
            <div key={row.id} className="flex items-start">
              <div className="flex flex-grow flex-col gap-4">
                <div className="grid flex-grow grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField label={t('fees.tuition.form.serviceArLabel')} required>
                    <Input
                      value={row.nameAr}
                      onChange={(e) => updatePaid(row.id, { nameAr: e.target.value })}
                      placeholder={t('fees.tuition.form.serviceArPlaceholder')}
                    />
                  </FormField>
                  <FormField label={t('fees.tuition.form.serviceEnLabel')} required>
                    <Input
                      value={row.nameEn}
                      onChange={(e) => updatePaid(row.id, { nameEn: e.target.value })}
                      placeholder={t('fees.tuition.form.serviceEnPlaceholder')}
                    />
                  </FormField>
                </div>

                <div className="grid flex-grow grid-cols-1">
                  <FormField label={t('fees.amount')} required>
                    <Input
                      type="number"
                      min={0}
                      value={row.amount}
                      onChange={(e) => updatePaid(row.id, { amount: e.target.value })}
                      placeholder={t('fees.tuition.form.amountPlaceholder')}
                    />
                  </FormField>
                </div>
              </div>
              <div className="flex justify-end">
                {values.paidServices.length > 1 ? (
                  <IconButton
                    status="delete"
                    variant="danger"
                    ariaLabel="Delete"
                    onClick={() => removePaid(row.id)}
                  />
                ) : (
                  <div className="h-8 w-8"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="rounded-2xl" padding="lg">
        <h3 className="mb-4 flex text-2xl font-medium text-black-700">
          {t('fees.tuition.form.paymentMethodsTitle')}
        </h3>
        <div className="flex flex-col gap-3">
          {lkPaymentMethods.map((method) => {
            const label =
              (currentLang === 'ar' ? method.arabicName : method.englishName) ||
              method.arabicName ||
              method.englishName;
            const checked = values.paymentMethodIds.includes(method.id);

            return (
              <CustomCheckbox
                key={method.id}
                checked={checked}
                onChange={(next) => {
                  const nextIds = next
                    ? Array.from(new Set([...values.paymentMethodIds, method.id]))
                    : values.paymentMethodIds.filter((x) => x !== method.id);
                  patch({ paymentMethodIds: nextIds });
                }}
                label={label}
                disabled={isLoadingLKPaymentMethods}
              />
            );
          })}

          {!isLoadingLKPaymentMethods && lkPaymentMethods.length === 0 && (
            <span className="text-sm text-gray-500">{t('common.noData')}</span>
          )}
        </div>
      </Card>

      <Card className="rounded-2xl" padding="lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-2xl font-medium text-black-700">
            {t('fees.tuition.form.installmentsTitle')}
          </h3>
          <button type="button" onClick={addPlan} disabled={hasEqualInstallmentPlan}>
            <CustomImage src={GreenPlusIcon} className="h-8 w-8" alt="Add" />
          </button>
        </div>

        <div className="space-y-6">
          {values.installmentPlans.map((plan, idx) => (
            <Card key={plan.id} className="rounded-2xl" padding="lg">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-2xl font-medium text-black-700">
                  {t('fees.tuition.form.planTitle')} {idx + 1}
                </h4>
                {values.installmentPlans.length > 1 && (
                  <IconButton
                    status="delete"
                    variant="danger"
                    ariaLabel="Delete"
                    onClick={() => removePlan(plan.id)}
                  />
                )}
              </div>

              <div className="mb-6 grid grid-cols-1 gap-4">
                <FormField label={t('fees.numberOfPayments')} required>
                  <Input
                    type="number"
                    min={1}
                    value={plan.paymentsCount}
                    onChange={(e) => handleChangePaymentsCount(plan, Number(e.target.value))}
                  />
                </FormField>

                <FormField label={t('fees.paymentDueOptions')} required>
                  <div className="flex items-center gap-6 text-sm">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        checked={plan.dueMode === 'equal'}
                        onChange={() => updatePlan(plan.id, { dueMode: 'equal' })}
                      />
                      <span className="text-base text-black-800">{t('fees.equalPayments')}</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        checked={plan.dueMode === 'ratio'}
                        onChange={() => updatePlan(plan.id, { dueMode: 'ratio' })}
                      />
                      <span className="text-base text-black-800">{t('fees.ratioPerPayment')}</span>
                    </label>
                  </div>
                </FormField>
              </div>

              <div className="space-y-4">
                {plan.rows.map((row) => (
                  <div key={row.id} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField label={t('fees.dueDate')} required>
                      <Input
                        type="date"
                        value={row.dueDate}
                        onChange={(e) =>
                          updatePlanRow(plan.id, row.id, { dueDate: e.target.value })
                        }
                        placeholder={t('common.chooseDate')}
                      />
                    </FormField>
                    <FormField label={t('fees.percentage')} required>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={row.percentage}
                        onChange={(e) =>
                          updatePlanRow(plan.id, row.id, { percentage: e.target.value })
                        }
                        placeholder={t('fees.tuition.percentagePlaceholder')}
                      />
                    </FormField>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <div className="flex flex-row-reverse gap-3 pt-2">
        <Button onClick={handleSubmit} variant="primary" disabled={isSubmitting}>
          {submitText}
        </Button>
        <Button onClick={onCancel} variant="outline" type="button" disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
      </div>
    </div>
  );
}
