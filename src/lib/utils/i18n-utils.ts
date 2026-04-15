import type { TFunction } from 'i18next';

/**
 * Returns the translated label with "(optional)" appended using the common.optional key.
 * Usage: tOptional(t, 'clients.streetName')
 */
export const tOptional = (t: TFunction, key: string): string =>
  `${t(key)} (${t('common.optional')})`;
