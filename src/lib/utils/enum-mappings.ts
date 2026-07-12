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
export const getSocialStatusLabel = (status: number | null | undefined, t: any): string => {
  if (status === null || status === undefined) return '-';
  const key = SocialStatusMap[status];
  return key ? t(key) : String(status);
};

/**
 * Get display label for identity type
 */
export const getIdentityTypeLabel = (type: number | null | undefined, t: any): string => {
  if (type === null || type === undefined) return '-';
  const key = ApplicantIdentityTypeMap[type];
  return key ? t(key) : String(type);
};
