import libphonenumber from 'google-libphonenumber';

const PhoneNumberUtil = libphonenumber.PhoneNumberUtil;
const phoneUtil = PhoneNumberUtil.getInstance();

export interface NormalizedPhoneForApi {
  phoneNumber: string;
  countryCode: string;
}

/**
 * Converts a phone string (typically coming from `react-international-phone`) into:
 * - `countryCode`: dial code in `+<digits>` format (e.g. `+966`)
 * - `phoneNumber`: national significant number (no country code)
 */
export function normalizePhoneForApi(input: string): NormalizedPhoneForApi {
  const trimmed = (input ?? '').trim();

  if (!trimmed) {
    return { phoneNumber: '', countryCode: '' };
  }

  try {
    const parsed = phoneUtil.parse(trimmed);
    const countryCode = parsed.getCountryCode();
    const nationalNumber = parsed.getNationalNumber();

    return {
      phoneNumber: String(nationalNumber ?? '').trim(),
      countryCode: `+${String(countryCode ?? '').trim()}`,
    };
  } catch {
    const compact = trimmed.replace(/\s+/g, '');
    const match = compact.match(/^\+(\d{1,4})(.*)$/);

    if (match) {
      const code = `+${match[1]}`;
      const restDigitsOnly = (match[2] ?? '').replace(/\D/g, '');
      return { phoneNumber: restDigitsOnly, countryCode: code };
    }

    return { phoneNumber: compact.replace(/\D/g, ''), countryCode: '' };
  }
}

/**
 * Builds a value suitable for the PhoneInput component.
 * Accepts backend-separated `countryCode` + `phoneNumber`.
 */
export function formatPhoneForInput(
  countryCode?: string | null,
  phoneNumber?: string | null
): string {
  const cc = (countryCode ?? '').trim();
  const pn = (phoneNumber ?? '').trim();

  if (!pn) return '';
  if (pn.startsWith('+')) return pn;
  if (!cc) return pn;

  const normalizedCc = cc.startsWith('+') ? cc : `+${cc}`;
  return `${normalizedCc}${pn}`.replace(/\s+/g, '');
}
