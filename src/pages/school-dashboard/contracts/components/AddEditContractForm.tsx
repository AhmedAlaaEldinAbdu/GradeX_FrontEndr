import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormField from '@/shared/components/FormField';
import Input from '@/shared/components/Input';
import TextArea from '@/shared/components/TextArea';
import CustomSelect, { type CustomSelectOption } from '@/shared/components/CustomSelect';
import Button from '@/shared/components/Button';
import PhoneInput from '@/shared/components/PhoneInput';
import FileUpload from '@/shared/components/FileUpload';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchCountries } from '@/redux/features/lookups/lookupsSlice';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';
import {
  ContractFormSchema,
  type ContractFormProps,
} from '@/validations/contracts-validations';

// Public shape used by the parent add/edit pages. Numerics stay as strings here
// because the parent code already calls `Number(values.x || 0)` when building
// the API payload — keep the contract stable so callers don't have to change.
export type ContractFormValues = {
  shortNationalAddress: string;
  schoolKind: 'company' | 'foundation' | '';
  commercialRegister: string;
  adminFees: string;
  taxNumber: string;
  representativeName: string;
  representativeRole: string;
  email: string;
  idType: 'national' | 'resident' | '';
  mobile: string;
  phone: string;
  nationality: string;
  withdrawalType: 'beforeTerm' | 'afterTerm';
  term: string;
  withdrawalPeriod: string;
  adminFeesDiscountPercentage: string;
};

type AddEditContractFormProps = {
  mode: 'add' | 'edit';
  initialValues?: Partial<ContractFormValues>;
  onCancel: () => void;
  onSubmit: (values: ContractFormValues, roleDocument: File | null) => void | Promise<void>;
};

const TERM_OPTIONS: CustomSelectOption[] = [
  { value: 'term-1', label: 'الفصل الدراسي الأول' },
  { value: 'term-2', label: 'الفصل الدراسي الثاني' },
];

// Kept at module scope so React keeps a stable component identity across
// re-renders — otherwise every keystroke would remount the whole subtree
// (and the focused input would lose focus + the page would scroll).
const RadioOption = ({
  id,
  name,
  value,
  label,
  checked,
  onChange,
}: {
  id?: string;
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) => (
  <label className="flex cursor-pointer items-center gap-2 text-sm text-[#3A3A3A]">
    <input
      id={id}
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
      className="h-4 w-4"
    />
    <span>{label}</span>
  </label>
);

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-2xl border border-[#EDEDED] bg-white p-5">
    <h3 className="mb-6 text-start text-base font-medium text-[#3A3A3A]">{title}</h3>
    {children}
  </div>
);

// Build RHF defaults from the parent's string-based shape. Numerics are parsed
// to numbers (or left undefined so yup's typeError fires on empty submit).
const buildDefaults = (initial?: Partial<ContractFormValues>): Partial<ContractFormProps> => ({
  shortNationalAddress: initial?.shortNationalAddress ?? '',
  schoolKind: initial?.schoolKind || undefined,
  commercialRegister: initial?.commercialRegister ?? '',
  adminFees:
    initial?.adminFees !== undefined && initial.adminFees !== ''
      ? Number(initial.adminFees)
      : (undefined as unknown as number),
  taxNumber: initial?.taxNumber ?? '',
  representativeName: initial?.representativeName ?? '',
  representativeRole: initial?.representativeRole ?? '',
  email: initial?.email ?? '',
  idType: initial?.idType || undefined,
  mobile: initial?.mobile ?? '',
  phone: initial?.phone ?? '',
  nationality: initial?.nationality ?? '',
  withdrawalType: initial?.withdrawalType ?? 'beforeTerm',
  term: initial?.term ?? '',
  withdrawalPeriod: initial?.withdrawalPeriod ?? '',
  adminFeesDiscountPercentage:
    initial?.adminFeesDiscountPercentage !== undefined &&
    initial.adminFeesDiscountPercentage !== ''
      ? Number(initial.adminFeesDiscountPercentage)
      : (undefined as unknown as number),
});

export default function AddEditContractForm({
  mode,
  initialValues,
  onCancel,
  onSubmit,
}: AddEditContractFormProps) {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';

  const [roleDocument, setRoleDocument] = useState<File | null>(null);
  const [roleDocumentError, setRoleDocumentError] = useState<string | undefined>();

  const countries = useAppSelector((state) => state.lookups?.countries ?? []);
  const isLoadingCountries = useAppSelector((state) => state.lookups?.isLoadingCountries ?? false);

  const {
    control,
    handleSubmit: rhfHandleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<ContractFormProps>({
    resolver: yupResolver(ContractFormSchema),
    mode: 'onBlur',
    defaultValues: buildDefaults(initialValues) as ContractFormProps,
  });

  const scrollToFirstError = useScrollToFirstError<ContractFormProps>();

  const watchedSchoolKind = watch('schoolKind');
  const watchedIdType = watch('idType');
  const watchedWithdrawalType = watch('withdrawalType');

  useEffect(() => {
    if (countries.length === 0) {
      dispatch(fetchCountries());
    }
  }, [dispatch, countries.length]);

  const nationalityOptions = useMemo<CustomSelectOption[]>(
    () =>
      countries.map((c: { id: string; arabicName: string; englishName: string }) => ({
        value: c.id,
        label: currentLang === 'ar' ? c.arabicName : c.englishName,
      })),
    [countries, currentLang]
  );

  const submit = async (data: ContractFormProps) => {
    // FileUpload sits outside the yup schema (same pattern as AddBook.tsx),
    // so validate it manually before forwarding to the parent.
    if (!roleDocument) {
      setRoleDocumentError(t('contracts.validation.roleDocumentRequired'));
      return;
    }
    setRoleDocumentError(undefined);

    const outgoing: ContractFormValues = {
      shortNationalAddress: data.shortNationalAddress,
      schoolKind: data.schoolKind as ContractFormValues['schoolKind'],
      commercialRegister: data.commercialRegister,
      adminFees: String(data.adminFees ?? ''),
      taxNumber: data.taxNumber,
      representativeName: data.representativeName,
      representativeRole: data.representativeRole,
      email: data.email,
      idType: data.idType as ContractFormValues['idType'],
      mobile: data.mobile,
      phone: data.phone,
      nationality: data.nationality,
      withdrawalType: data.withdrawalType as ContractFormValues['withdrawalType'],
      term: data.term,
      withdrawalPeriod: data.withdrawalPeriod,
      adminFeesDiscountPercentage: String(data.adminFeesDiscountPercentage ?? ''),
    };

    await onSubmit(outgoing, roleDocument);
  };

  return (
    <form onSubmit={rhfHandleSubmit(submit, scrollToFirstError)} className="space-y-4">
      <SectionCard title={t('contracts.sections.schoolData')}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            label={t('contracts.form.shortNationalAddress')}
            required
            error={errors.shortNationalAddress?.message}
            htmlFor="shortNationalAddress"
          >
            <Controller
              name="shortNationalAddress"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  id="shortNationalAddress"
                  placeholder={t('contracts.form.shortNationalAddressPlaceholder')}
                  rows={3}
                  autoComplete="street-address"
                />
              )}
            />
          </FormField>

          <FormField
            label={t('contracts.form.schoolKind')}
            required
            error={errors.schoolKind?.message}
            htmlFor="schoolKind"
          >
            <div className="flex items-center gap-6 pt-3">
              <RadioOption
                id="schoolKind"
                name="schoolKind"
                value="company"
                label={t('contracts.form.schoolKindCompany')}
                checked={watchedSchoolKind === 'company'}
                onChange={() =>
                  setValue('schoolKind', 'company', { shouldValidate: true, shouldDirty: true })
                }
              />
              <RadioOption
                name="schoolKind"
                value="foundation"
                label={t('contracts.form.schoolKindFoundation')}
                checked={watchedSchoolKind === 'foundation'}
                onChange={() =>
                  setValue('schoolKind', 'foundation', { shouldValidate: true, shouldDirty: true })
                }
              />
            </div>
          </FormField>

          <FormField
            label={t('contracts.form.commercialRegister')}
            required
            error={errors.commercialRegister?.message}
            htmlFor="commercialRegister"
          >
            <Controller
              name="commercialRegister"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="commercialRegister"
                  placeholder={t('contracts.form.commercialRegisterPlaceholder')}
                  autoComplete="off"
                />
              )}
            />
          </FormField>

          <FormField
            label={t('contracts.form.adminFees')}
            required
            error={errors.adminFees?.message}
            htmlFor="adminFees"
          >
            <Controller
              name="adminFees"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="adminFees"
                  type="number"
                  min={0}
                  placeholder={t('contracts.form.adminFeesPlaceholder')}
                  autoComplete="off"
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                  }
                />
              )}
            />
          </FormField>

          <div className="md:col-span-2">
            <FormField
              label={t('contracts.form.taxNumber')}
              required
              error={errors.taxNumber?.message}
              htmlFor="taxNumber"
            >
              <Controller
                name="taxNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="taxNumber"
                    placeholder={t('contracts.form.taxNumberPlaceholder')}
                    autoComplete="off"
                  />
                )}
              />
            </FormField>
          </div>
        </div>
      </SectionCard>

      <SectionCard title={t('contracts.sections.representative')}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            label={t('contracts.form.representativeName')}
            required
            error={errors.representativeName?.message}
            htmlFor="representativeName"
          >
            <Controller
              name="representativeName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="representativeName"
                  placeholder={t('contracts.form.representativeNamePlaceholder')}
                  autoComplete="name"
                />
              )}
            />
          </FormField>

          <FormField
            label={t('contracts.form.representativeRole')}
            required
            error={errors.representativeRole?.message}
            htmlFor="representativeRole"
          >
            <Controller
              name="representativeRole"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="representativeRole"
                  placeholder={t('contracts.form.representativeRolePlaceholder')}
                  autoComplete="organization-title"
                />
              )}
            />
          </FormField>

          <div className="md:col-span-2" data-form-field="roleDocument">
            <FileUpload
              label={t('contracts.form.roleDocument')}
              accept="image/png,image/jpg,image/jpeg,image/gif,image/svg+xml,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setRoleDocument(file);
                if (file) setRoleDocumentError(undefined);
              }}
              onDelete={() => setRoleDocument(null)}
              files={roleDocument ? [roleDocument] : []}
              fileName={roleDocument?.name}
              required
              uploadText={t('contracts.form.roleDocumentHint')}
              formatHints={['SVG', 'JPG', 'PNG', 'GIF', 'PDF', 'DOC', 'XLS', 'PPT', 'TXT']}
            />
            {roleDocumentError && (
              <p className="mt-1 text-sm text-red-500">{roleDocumentError}</p>
            )}
          </div>

          <div className="md:col-span-2">
            {/* No htmlFor — CustomSelect doesn't expose a matching id to attach a <label for=> to. */}
            <FormField
              label={t('contracts.form.nationality')}
              required
              error={errors.nationality?.message}
            >
              <Controller
                name="nationality"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={(v) => {
                      const val = Array.isArray(v) ? v[0] : v;
                      field.onChange(val);
                    }}
                    options={nationalityOptions}
                    placeholder={t('contracts.form.nationalityPlaceholder')}
                    disabled={isLoadingCountries}
                    error={!!errors.nationality}
                    maxHeight="200px"
                  />
                )}
              />
            </FormField>
          </div>

          <FormField
            label={t('contracts.form.email')}
            required
            error={errors.email?.message}
            htmlFor="email"
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="email"
                  type="email"
                  placeholder={t('contracts.form.emailPlaceholder')}
                  autoComplete="email"
                />
              )}
            />
          </FormField>

          <FormField
            label={t('contracts.form.idType')}
            required
            error={errors.idType?.message}
            htmlFor="idType"
          >
            <div className="flex items-center gap-6 pt-3">
              <RadioOption
                id="idType"
                name="idType"
                value="national"
                label={t('contracts.form.idTypeNational')}
                checked={watchedIdType === 'national'}
                onChange={() =>
                  setValue('idType', 'national', { shouldValidate: true, shouldDirty: true })
                }
              />
              <RadioOption
                name="idType"
                value="resident"
                label={t('contracts.form.idTypeResident')}
                checked={watchedIdType === 'resident'}
                onChange={() =>
                  setValue('idType', 'resident', { shouldValidate: true, shouldDirty: true })
                }
              />
            </div>
          </FormField>

          {/* No htmlFor on PhoneInput-wrapping FormFields — PhoneInput doesn't expose its inner id. */}
          <FormField
            label={t('contracts.form.mobile')}
            required
            error={errors.mobile?.message}
          >
            <Controller
              name="mobile"
              control={control}
              render={({ field }) => (
                <PhoneInput value={field.value ?? ''} onChange={field.onChange} required />
              )}
            />
          </FormField>

          <FormField
            label={t('contracts.form.phone')}
            required
            error={errors.phone?.message}
          >
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <PhoneInput value={field.value ?? ''} onChange={field.onChange} required />
              )}
            />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title={t('contracts.sections.withdrawal')}>
        <div className="mb-4">
          <FormField
            label={t('contracts.form.withdrawalType')}
            required
            error={errors.withdrawalType?.message}
            htmlFor="withdrawalType"
          >
            <div className="flex flex-wrap items-center gap-6 pt-3">
              <RadioOption
                id="withdrawalType"
                name="withdrawalType"
                value="beforeTerm"
                label={t('contracts.form.withdrawalBeforeTerm')}
                checked={watchedWithdrawalType === 'beforeTerm'}
                onChange={() =>
                  setValue('withdrawalType', 'beforeTerm', {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              />
              <RadioOption
                name="withdrawalType"
                value="afterTerm"
                label={t('contracts.form.withdrawalAfterTerm')}
                checked={watchedWithdrawalType === 'afterTerm'}
                onChange={() =>
                  setValue('withdrawalType', 'afterTerm', {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              />
            </div>
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* No htmlFor — CustomSelect doesn't expose a matching id. */}
          <FormField
            label={t('contracts.form.term')}
            required
            error={errors.term?.message}
          >
            <Controller
              name="term"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  value={field.value}
                  onChange={(v) => {
                    const val = Array.isArray(v) ? v[0] : v;
                    field.onChange(val);
                  }}
                  options={TERM_OPTIONS}
                  placeholder={t('contracts.form.termPlaceholder')}
                  error={!!errors.term}
                  maxHeight="200px"
                />
              )}
            />
          </FormField>

          <FormField
            label={t('contracts.form.withdrawalPeriod')}
            required
            error={errors.withdrawalPeriod?.message}
            htmlFor="withdrawalPeriod"
          >
            <Controller
              name="withdrawalPeriod"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="withdrawalPeriod"
                  placeholder={t('contracts.form.withdrawalPeriodPlaceholder')}
                  autoComplete="off"
                />
              )}
            />
          </FormField>

          <div className="md:col-span-2">
            <FormField
              label={t('contracts.form.adminFeesDiscountPercentage')}
              required
              error={errors.adminFeesDiscountPercentage?.message}
              htmlFor="adminFeesDiscountPercentage"
            >
              <Controller
                name="adminFeesDiscountPercentage"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="adminFeesDiscountPercentage"
                    type="number"
                    min={0}
                    max={100}
                    placeholder={t('contracts.form.adminFeesDiscountPercentagePlaceholder')}
                    autoComplete="off"
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                    }
                  />
                )}
              />
            </FormField>
          </div>
        </div>
      </SectionCard>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting} loading={isSubmitting}>
          {t(mode === 'add' ? 'common.add' : 'common.saveChanges')}
        </Button>
      </div>
    </form>
  );
}
