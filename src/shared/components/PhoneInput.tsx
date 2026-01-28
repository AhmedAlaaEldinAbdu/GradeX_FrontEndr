import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PhoneInput as ReactPhoneInput,
  type PhoneInputProps as ReactPhoneInputProps,
  defaultCountries,
  type CountryData,
} from 'react-international-phone';
import 'react-international-phone/style.css';
import './PhoneInput.css';

interface PhoneInputProps extends Omit<ReactPhoneInputProps, 'onChange'> {
  label?: string;
  error?: string;
  required?: boolean;
  onChange?: (value: string) => void;
  showDialCodeInField?: boolean;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  error,
  required = false,
  onChange,
  showDialCodeInField = true,
  ...props
}) => {
  const { i18n } = useTranslation();

  const translatedCountries = useMemo(() => {
    try {
      const regionNames = new Intl.DisplayNames([i18n.language], { type: 'region' });
      return defaultCountries.map((country) => {
        const iso2 = country[1];
        const translatedName = regionNames.of(iso2.toUpperCase());
        if (translatedName) {
          const newCountry = [...country];
          newCountry[0] = translatedName;
          return newCountry as CountryData;
        }
        return country;
      });
    } catch {
      // Fallback if Intl.DisplayNames is not supported or fails
      return defaultCountries;
    }
  }, [i18n.language]);

  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-start text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="phone-input-wrapper" dir="rtl">
        <ReactPhoneInput
          {...props}
          defaultCountry="sa"
          countries={translatedCountries}
          onChange={(phone) => {
            if (onChange) {
              onChange(phone);
            }
          }}
          inputClassName={`phone-input-field ${error ? 'phone-input-error' : ''}`}
          countrySelectorStyleProps={{
            buttonClassName: `phone-country-selector ${error ? 'phone-country-selector-error' : ''}`,
            dropdownStyleProps: {
              listItemDialCodeStyle: !showDialCodeInField ? { display: 'none' } : undefined,
            },
          }}
          // When showDialCodeInField is false, hide the dial code from input
          disableDialCodePrefill={!showDialCodeInField}
          disableDialCodeAndPrefix={!showDialCodeInField}
          showDisabledDialCodeAndPrefix={false}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default PhoneInput;
