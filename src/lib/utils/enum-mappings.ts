import { SocialStatus, ApplicantIdentityType } from '../../shared/enums/enums';

/**
 * Map SocialStatus enum values to i18n translation keys
 */
export const SocialStatusMap: Record<number, string> = {
  [SocialStatus.Single]: 'teachers.details.socialStatus.single',
  [SocialStatus.Married]: 'teachers.details.socialStatus.married',
  [SocialStatus.Divorced]: 'teachers.details.socialStatus.divorced',
  [SocialStatus.Widowed]: 'teachers.details.socialStatus.widowed',
};

/**
 * Map ApplicantIdentityType enum values to i18n translation keys
 */
export const ApplicantIdentityTypeMap: Record<number, string> = {
  [ApplicantIdentityType.National]: 'common.identityType.national',
  [ApplicantIdentityType.ResidenceID]: 'common.identityType.residence',
};

/**
 * Get display label for social status
 */
export const getSocialStatusLabel = (status: number | string | null | undefined, t: any): string => {
  if (status === null || status === undefined || status === '') return '-';
  const numStatus = typeof status === 'string' ? parseInt(status, 10) : status;
  if (isNaN(numStatus)) return String(status);
  const key = SocialStatusMap[numStatus];
  return key ? t(key) : String(status);
};

/**
 * Get display label for identity type
 */
export const getIdentityTypeLabel = (type: number | string | null | undefined, t: any): string => {
  if (type === null || type === undefined || type === '') return '-';
  const numType = typeof type === 'string' ? parseInt(type, 10) : type;
  if (isNaN(numType)) return String(type);
  const key = ApplicantIdentityTypeMap[numType];
  return key ? t(key) : String(type);
};
