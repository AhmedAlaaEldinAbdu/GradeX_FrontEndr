import libphonenumber from 'google-libphonenumber';

const PhoneNumberUtil = libphonenumber.PhoneNumberUtil;
const PhoneNumberType = libphonenumber.PhoneNumberType;
const phoneUtil = PhoneNumberUtil.getInstance();

export const isValidPhoneNumber = (phone: string): boolean => {
  if (!phone) return true;

  try {
    const parsedNumber = phoneUtil.parse(phone);
    return phoneUtil.isValidNumber(parsedNumber);
  } catch {
    return false;
  }
};

export const isValidMobileNumber = (phone: string): boolean => {
  if (!phone) return true;

  try {
    const parsedNumber = phoneUtil.parse(phone);
    if (!phoneUtil.isValidNumber(parsedNumber)) {
      return false;
    }

    const numberType = phoneUtil.getNumberType(parsedNumber);
    return (
      numberType === PhoneNumberType.MOBILE || numberType === PhoneNumberType.FIXED_LINE_OR_MOBILE
    );
  } catch {
    return false;
  }
};

export const isValidLandlineNumber = (phone: string): boolean => {
  if (!phone) return true;

  try {
    const parsedNumber = phoneUtil.parse(phone);
    const nationalNumber = parsedNumber.getNationalNumber()?.toString() || '';

    return nationalNumber.length >= 5 && nationalNumber.length <= 15;
  } catch {
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 5 && digitsOnly.length <= 15;
  }
};
