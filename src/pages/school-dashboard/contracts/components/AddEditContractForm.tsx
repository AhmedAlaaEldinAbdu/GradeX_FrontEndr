import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FormField from '@/shared/components/FormField';
import Input from '@/shared/components/Input';
import TextArea from '@/shared/components/TextArea';
import CustomSelect, { type CustomSelectOption } from '@/shared/components/CustomSelect';
import Button from '@/shared/components/Button';
import PhoneInput from '@/shared/components/PhoneInput';
import FileUpload from '@/shared/components/FileUpload';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchCountries } from '@/redux/features/lookups/lookupsSlice';

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

const DEFAULT_VALUES: ContractFormValues = {
  shortNationalAddress: '',
  schoolKind: '',
  commercialRegister: '',
  adminFees: '',
  taxNumber: '',
  representativeName: '',
  representativeRole: '',
  email: '',
  idType: '',
  mobile: '',
  phone: '',
  nationality: '',
  withdrawalType: 'beforeTerm',
  term: '',
  withdrawalPeriod: '',
  adminFeesDiscountPercentage: '',
};

const TERM_OPTIONS: CustomSelectOption[] = [
  { value: 'term-1', label: 'الفصل الدراسي الأول' },
  { value: 'term-2', label: 'الفصل الدراسي الثاني' },
  { value: 'term-3', label: 'الفصل الدراسي الثالث' },
];

export default function AddEditContractForm({
  mode,
  initialValues,
  onCancel,
  onSubmit,
}: AddEditContractFormProps) {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';

  const [values, setValues] = useState<ContractFormValues>(() => ({
    ...DEFAULT_VALUES,
    ...(initialValues ?? {}),
  }));
  const [roleDocument, setRoleDocument] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const countries = useAppSelector((state) => state.lookups?.countries ?? []);
  const isLoadingCountries = useAppSelector((state) => state.lookups?.isLoadingCountries ?? false);

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

  const setField = <K extends keyof ContractFormValues>(key: K, value: ContractFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(values, roleDocument);
    } finally {
      setIsSubmitting(false);
    }
  };

  const RadioOption = ({
    name,
    value,
    label,
    checked,
    onChange,
  }: {
    name: string;
    value: string;
    label: string;
    checked: boolean;
    onChange: () => void;
  }) => (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-[#3A3A3A]">
      <input
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SectionCard title={t('contracts.sections.schoolData')}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            label={t('contracts.form.shortNationalAddress')}
            required
            htmlFor="shortNationalAddress"
          >
            <TextArea
              id="shortNationalAddress"
              value={values.shortNationalAddress}
              onChange={(e) => setField('shortNationalAddress', e.target.value)}
              placeholder={t('contracts.form.shortNationalAddressPlaceholder')}
              rows={3}
            />
          </FormField>

          <FormField label={t('contracts.form.schoolKind')} required htmlFor="schoolKind">
            <div className="flex items-center gap-6 pt-3">
              <RadioOption
                name="schoolKind"
                value="company"
                label={t('contracts.form.schoolKindCompany')}
                checked={values.schoolKind === 'company'}
                onChange={() => setField('schoolKind', 'company')}
              />
              <RadioOption
                name="schoolKind"
                value="foundation"
                label={t('contracts.form.schoolKindFoundation')}
                checked={values.schoolKind === 'foundation'}
                onChange={() => setField('schoolKind', 'foundation')}
              />
            </div>
          </FormField>

          <FormField
            label={t('contracts.form.commercialRegister')}
            required
            htmlFor="commercialRegister"
          >
            <Input
              id="commercialRegister"
              value={values.commercialRegister}
              onChange={(e) => setField('commercialRegister', e.target.value)}
              placeholder={t('contracts.form.commercialRegisterPlaceholder')}
            />
          </FormField>

          <FormField label={t('contracts.form.adminFees')} required htmlFor="adminFees">
            <Input
              id="adminFees"
              type="number"
              value={values.adminFees}
              onChange={(e) => setField('adminFees', e.target.value)}
              placeholder={t('contracts.form.adminFeesPlaceholder')}
            />
          </FormField>

          <div className="md:col-span-2">
            <FormField label={t('contracts.form.taxNumber')} required htmlFor="taxNumber">
              <Input
                id="taxNumber"
                value={values.taxNumber}
                onChange={(e) => setField('taxNumber', e.target.value)}
                placeholder={t('contracts.form.taxNumberPlaceholder')}
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
            htmlFor="representativeName"
          >
            <Input
              id="representativeName"
              value={values.representativeName}
              onChange={(e) => setField('representativeName', e.target.value)}
              placeholder={t('contracts.form.representativeNamePlaceholder')}
            />
          </FormField>

          <FormField
            label={t('contracts.form.representativeRole')}
            required
            htmlFor="representativeRole"
          >
            <Input
              id="representativeRole"
              value={values.representativeRole}
              onChange={(e) => setField('representativeRole', e.target.value)}
              placeholder={t('contracts.form.representativeRolePlaceholder')}
            />
          </FormField>

          <div className="md:col-span-2">
            <FileUpload
              label={t('contracts.form.roleDocument')}
              accept="image/png,image/jpg,image/jpeg,image/gif,image/svg+xml,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setRoleDocument(file);
              }}
              onDelete={() => setRoleDocument(null)}
              files={roleDocument ? [roleDocument] : []}
              fileName={roleDocument?.name}
              required
              uploadText={t('contracts.form.roleDocumentHint')}
              formatHints={['SVG', 'JPG', 'PNG', 'GIF', 'PDF', 'DOC', 'XLS', 'PPT', 'TXT']}
            />
          </div>

          <FormField label={t('contracts.form.email')} required htmlFor="email">
            <Input
              id="email"
              type="email"
              value={values.email}
              onChange={(e) => setField('email', e.target.value)}
              placeholder={t('contracts.form.emailPlaceholder')}
            />
          </FormField>

          <FormField label={t('contracts.form.idType')} required htmlFor="idType">
            <div className="flex items-center gap-6 pt-3">
              <RadioOption
                name="idType"
                value="national"
                label={t('contracts.form.idTypeNational')}
                checked={values.idType === 'national'}
                onChange={() => setField('idType', 'national')}
              />
              <RadioOption
                name="idType"
                value="resident"
                label={t('contracts.form.idTypeResident')}
                checked={values.idType === 'resident'}
                onChange={() => setField('idType', 'resident')}
              />
            </div>
          </FormField>

          <FormField label={t('contracts.form.mobile')} required htmlFor="mobile">
            <PhoneInput value={values.mobile} onChange={(v) => setField('mobile', v)} required />
          </FormField>

          <FormField label={t('contracts.form.phone')} required htmlFor="phone">
            <PhoneInput value={values.phone} onChange={(v) => setField('phone', v)} required />
          </FormField>

          <FormField label={t('contracts.form.nationality')} required htmlFor="nationality">
            <CustomSelect
              value={values.nationality}
              onChange={(v) => setField('nationality', v as string)}
              options={nationalityOptions}
              placeholder={t('contracts.form.nationalityPlaceholder')}
              disabled={isLoadingCountries}
              maxHeight="200px"
            />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title={t('contracts.sections.withdrawal')}>
        <div className="mb-4">
          <FormField label={t('contracts.form.withdrawalType')} required htmlFor="withdrawalType">
            <div className="flex flex-wrap items-center gap-6 pt-3">
              <RadioOption
                name="withdrawalType"
                value="beforeTerm"
                label={t('contracts.form.withdrawalBeforeTerm')}
                checked={values.withdrawalType === 'beforeTerm'}
                onChange={() => setField('withdrawalType', 'beforeTerm')}
              />
              <RadioOption
                name="withdrawalType"
                value="afterTerm"
                label={t('contracts.form.withdrawalAfterTerm')}
                checked={values.withdrawalType === 'afterTerm'}
                onChange={() => setField('withdrawalType', 'afterTerm')}
              />
            </div>
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label={t('contracts.form.term')} required htmlFor="term">
            <CustomSelect
              value={values.term}
              onChange={(v) => setField('term', v as string)}
              options={TERM_OPTIONS}
              placeholder={t('contracts.form.termPlaceholder')}
              maxHeight="200px"
            />
          </FormField>

          <FormField
            label={t('contracts.form.withdrawalPeriod')}
            required
            htmlFor="withdrawalPeriod"
          >
            <Input
              id="withdrawalPeriod"
              value={values.withdrawalPeriod}
              onChange={(e) => setField('withdrawalPeriod', e.target.value)}
              placeholder={t('contracts.form.withdrawalPeriodPlaceholder')}
            />
          </FormField>

          <div className="md:col-span-2">
            <FormField
              label={t('contracts.form.adminFeesDiscountPercentage')}
              required
              htmlFor="adminFeesDiscountPercentage"
            >
              <Input
                id="adminFeesDiscountPercentage"
                type="number"
                value={values.adminFeesDiscountPercentage}
                onChange={(e) => setField('adminFeesDiscountPercentage', e.target.value)}
                placeholder={t('contracts.form.adminFeesDiscountPercentagePlaceholder')}
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
