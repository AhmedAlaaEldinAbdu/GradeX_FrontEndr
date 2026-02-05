import { OfferApplyOn, OfferField, OfferOperator } from '@/shared/enums/enums';
import type { OfferDto } from '@/services/api/types/offer.types';
import type { DiscountOfferFormValues } from '../components/AddEditDiscountOfferForm';

export const toInputDate = (value: string) => {
    if (!value) return '';
    const isoDate = value.split('T')[0];
    return /^\d{4}-\d{2}-\d{2}$/.test(isoDate) ? isoDate : value;
};

export const toIsoDateTime = (value: string) => {
    if (!value) return '';
    return value.includes('T') ? value : `${value}T00:00:00.000Z`;
};

export const offerDtoToFormValues = (o: OfferDto): DiscountOfferFormValues => {
    const discountType: DiscountOfferFormValues['discountType'] =
        o.percentage !== null && o.percentage !== undefined ? 'percentage' : 'value';

    const conditions = (o.conditions ?? []).length
        ? (o.conditions ?? []).map((c) => ({
            field: c.field as unknown as DiscountOfferFormValues['conditions'][number]['field'],
            operator:
                c.operator as unknown as DiscountOfferFormValues['conditions'][number]['operator'],
            value: c.value === null || c.value === undefined ? '' : String(c.value),
        }))
        : [
            {
                field: OfferField.AlwaysTrue,
                operator: OfferOperator.Equals,
                value: 'true',
            },
        ];

    return {
        id: o.id,
        nameAr: o.nameAr,
        nameEn: o.nameEn,
        discountType,
        discountValue: discountType === 'percentage' ? String(o.percentage ?? '') : String(o.amount ?? ''),
        startDate: toInputDate(o.startDate),
        endDate: toInputDate(o.endDate),
        isActive: !!o.isActive,
        matchAllConditions: o.matchAllConditions ?? true,
        applyOn: (o.applyOn ?? OfferApplyOn.TuitionFees) as OfferApplyOn,
        conditions,
    };
};

export const formValuesToOfferPayload = (
    schoolBranchId: string,
    form: DiscountOfferFormValues,
    base?: OfferDto
) => {
    const numericValue = form.discountValue === '' ? 0 : Number(form.discountValue);

    const conditions = (form.conditions ?? []).length
        ? (form.conditions ?? []).map((c) => ({
            field: c.field,
            operator: c.operator,
            value: c.value,
        }))
        : [
            {
                field: OfferField.AlwaysTrue,
                operator: OfferOperator.Equals,
                value: 'true',
            },
        ];

    return {
        schoolBranchId: base?.schoolBranchId ?? schoolBranchId,
        nameAr: form.nameAr,
        nameEn: form.nameEn,
        offerType: base?.offerType ?? 1,
        amount: form.discountType === 'value' ? numericValue : 0,
        percentage: form.discountType === 'percentage' ? numericValue : 0,
        applyOn:
            (form.applyOn ?? (base?.applyOn ?? OfferApplyOn.TuitionFees)) as unknown as number,
        startDate: form.startDate ? toIsoDateTime(form.startDate) : base?.startDate ?? '',
        endDate: form.endDate ? toIsoDateTime(form.endDate) : base?.endDate ?? '',
        isActive: !!form.isActive,
        matchAllConditions:
            typeof form.matchAllConditions === 'boolean'
                ? form.matchAllConditions
                : (base?.matchAllConditions ?? true),
        conditions,
    };
};
