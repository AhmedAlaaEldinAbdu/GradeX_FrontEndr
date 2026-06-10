import { number, object, string, type InferType } from 'yup';

/**
 * Validation schema for the school-contract form (add + edit share the same shape).
 * `roleDocument` (the representative-role file) is validated separately in the
 * component since FileUpload doesn't fit react-hook-form's Controller API
 * cleanly — same pattern as AddBook.tsx with its image field.
 */
export const ContractFormSchema = object({
  shortNationalAddress: string()
    .required('contracts.validation.shortNationalAddressRequired')
    .typeError('contracts.validation.shortNationalAddressRequired'),
  schoolKind: string()
    .oneOf(['company', 'foundation'], 'contracts.validation.schoolKindRequired')
    .required('contracts.validation.schoolKindRequired'),
  commercialRegister: string()
    .required('contracts.validation.commercialRegisterRequired')
    .typeError('contracts.validation.commercialRegisterRequired'),
  adminFees: number()
    .typeError('contracts.validation.adminFeesRequired')
    .required('contracts.validation.adminFeesRequired')
    .min(0, 'contracts.validation.adminFeesPositive'),
  taxNumber: string()
    .required('contracts.validation.taxNumberRequired')
    .typeError('contracts.validation.taxNumberRequired'),
  representativeName: string()
    .required('contracts.validation.representativeNameRequired')
    .typeError('contracts.validation.representativeNameRequired'),
  representativeRole: string()
    .required('contracts.validation.representativeRoleRequired')
    .typeError('contracts.validation.representativeRoleRequired'),
  email: string()
    .required('contracts.validation.emailRequired')
    .email('contracts.validation.emailInvalid')
    .typeError('contracts.validation.emailRequired'),
  idType: string()
    .oneOf(['national', 'resident'], 'contracts.validation.idTypeRequired')
    .required('contracts.validation.idTypeRequired'),
  mobile: string()
    .required('contracts.validation.mobileRequired')
    .matches(/^[+\d\s\-()]{6,}$/, 'contracts.validation.mobileInvalid'),
  // Accept any phone number format (only required) — no strict pattern.
  phone: string().required('contracts.validation.phoneRequired'),
  nationality: string()
    .required('contracts.validation.nationalityRequired')
    .typeError('contracts.validation.nationalityRequired'),
  withdrawalType: string()
    .oneOf(
      ['beforeTerm', 'afterTerm'],
      'contracts.validation.withdrawalTypeRequired'
    )
    .required('contracts.validation.withdrawalTypeRequired'),
  term: string()
    .required('contracts.validation.termRequired')
    .typeError('contracts.validation.termRequired'),
  withdrawalPeriod: string()
    .required('contracts.validation.withdrawalPeriodRequired')
    .typeError('contracts.validation.withdrawalPeriodRequired'),
  adminFeesDiscountPercentage: number()
    .typeError('contracts.validation.adminFeesDiscountRequired')
    .required('contracts.validation.adminFeesDiscountRequired')
    .min(0, 'contracts.validation.adminFeesDiscountRange')
    .max(100, 'contracts.validation.adminFeesDiscountRange'),
});

export type ContractFormProps = InferType<typeof ContractFormSchema>;
